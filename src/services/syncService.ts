import { supabase } from "@/lib/supabase";
import { ChaptersRead } from "../../hooks/useBooks";
import { getStickyValue, setStickyValue } from "../../hooks/useStickyState";

interface ReadingProgressRecord {
  book_name: string;
  chapter: number;
  read_date: string;
}

export class SyncService {
  private supabase = supabase;

  /**
   * Sync local reading progress to Supabase
   */
  async syncToCloud(): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    try {
      // Get all local storage data
      const localData = this.getAllLocalReadingProgress();
      
      // Convert to database format
      const records: ReadingProgressRecord[] = [];
      
      for (const [bookName, chapters] of Object.entries(localData)) {
        const chaptersRead = chapters as ChaptersRead;
        for (const [chapter, dates] of Object.entries(chaptersRead)) {
          for (const date of dates) {
            records.push({
              book_name: bookName,
              chapter: parseInt(chapter),
              read_date: new Date(date).toISOString().split('T')[0]
            });
          }
        }
      }

      // Batch upsert to Supabase
      if (records.length > 0) {
        const { error } = await this.supabase
          .from('reading_progress')
          .upsert(
            records.map(record => ({
              user_id: user.id,
              ...record
            })),
            { 
              onConflict: 'user_id,book_name,chapter,read_date',
              ignoreDuplicates: true 
            }
          );

        if (error) {
          console.error('Error syncing to cloud:', error);
          throw error;
        }
      }

      // Update last sync time
      await this.updateLastSyncTime();
    } catch (error) {
      console.error('Sync to cloud failed:', error);
      throw error;
    }
  }

  /**
   * Sync reading progress from Supabase to local storage
   */
  async syncFromCloud(): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    try {
      // Get all reading progress from Supabase
      const { data: records, error } = await this.supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('book_name')
        .order('chapter')
        .order('read_date');

      if (error) {
        console.error('Error fetching from cloud:', error);
        throw error;
      }

      if (!records || records.length === 0) return;

      // Group by book
      const bookData: Record<string, ChaptersRead> = {};
      
      for (const record of records) {
        if (!bookData[record.book_name]) {
          bookData[record.book_name] = {};
        }
        
        if (!bookData[record.book_name][record.chapter]) {
          bookData[record.book_name][record.chapter] = [];
        }
        
        const readDate = new Date(record.read_date);
        bookData[record.book_name][record.chapter].push(readDate);
      }

      // Save to local storage
      for (const [bookName, chapters] of Object.entries(bookData)) {
        setStickyValue<ChaptersRead>(bookName, chapters);
      }

      // Update last sync time
      await this.updateLastSyncTime();
    } catch (error) {
      console.error('Sync from cloud failed:', error);
      throw error;
    }
  }

  /**
   * Perform a two-way sync (merge local and cloud data)
   */
  async performTwoWaySync(): Promise<void> {
    console.log('performTwoWaySync: Starting...');
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    
    if (userError) {
      console.error('performTwoWaySync: Error getting user:', userError);
      throw userError;
    }
    
    if (!user) {
      console.log('performTwoWaySync: No user found, returning');
      return;
    }
    
    console.log('performTwoWaySync: User found:', user.email);

    try {
      // First, get cloud data
      console.log('performTwoWaySync: Fetching cloud data...');
      const { data: cloudRecords, error: fetchError } = await this.supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('performTwoWaySync: Error fetching cloud data:', fetchError);
        throw fetchError;
      }
      
      console.log(`performTwoWaySync: Fetched ${cloudRecords?.length || 0} cloud records`);

      // Get local data
      console.log('performTwoWaySync: Getting local data...');
      const localData = this.getAllLocalReadingProgress();
      console.log('performTwoWaySync: Local data keys:', Object.keys(localData));
      
      // Convert cloud data to local format for comparison
      const cloudData: Record<string, ChaptersRead> = {};
      if (cloudRecords) {
        for (const record of cloudRecords) {
          if (!cloudData[record.book_name]) {
            cloudData[record.book_name] = {};
          }
          if (!cloudData[record.book_name][record.chapter]) {
            cloudData[record.book_name][record.chapter] = [];
          }
          cloudData[record.book_name][record.chapter].push(new Date(record.read_date));
        }
      }

      // Merge data (union of both sets)
      const mergedData: Record<string, ChaptersRead> = { ...cloudData };
      
      for (const [bookName, chapters] of Object.entries(localData)) {
        const localChapters = chapters as ChaptersRead;
        
        if (!mergedData[bookName]) {
          // Convert string dates to Date objects when adding local data
          mergedData[bookName] = {};
          for (const [chapter, dates] of Object.entries(localChapters)) {
            mergedData[bookName][parseInt(chapter)] = (dates as any[]).map(d => 
              typeof d === 'string' ? new Date(d) : d
            );
          }
        } else {
          for (const [chapter, dates] of Object.entries(localChapters)) {
            const chapterNum = parseInt(chapter);
            if (!mergedData[bookName][chapterNum]) {
              // Convert string dates to Date objects
              mergedData[bookName][chapterNum] = (dates as any[]).map(d => 
                typeof d === 'string' ? new Date(d) : d
              );
            } else {
              // Merge dates, removing duplicates
              const existingDates = mergedData[bookName][chapterNum].map(d => d.getTime());
              for (const date of dates as any[]) {
                // Convert string to Date if needed
                const dateObj = typeof date === 'string' ? new Date(date) : date;
                if (!existingDates.includes(dateObj.getTime())) {
                  mergedData[bookName][chapterNum].push(dateObj);
                }
              }
            }
          }
        }
      }

      // Save merged data to both local and cloud
      for (const [bookName, chapters] of Object.entries(mergedData)) {
        setStickyValue<ChaptersRead>(bookName, chapters);
      }

      // Sync merged data to cloud
      console.log('performTwoWaySync: Syncing merged data to cloud...');
      await this.syncToCloud();
      console.log('performTwoWaySync: Sync complete!');
      
    } catch (error) {
      console.error('Two-way sync failed:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint
      });
      throw error;
    }
  }

  /**
   * Get all local reading progress from localStorage
   */
  private getAllLocalReadingProgress(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    // Get all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('supabase.') && key !== 'version' && key !== 'lastDatePlayed' && key !== 'theme') {
        try {
          const rawValue = localStorage.getItem(key);
          if (!rawValue) continue;
          
          // Try to parse as JSON
          const value = JSON.parse(rawValue);
          
          // Check if it's reading progress data (has chapter numbers as keys)
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            const keys = Object.keys(value);
            // Validate that this looks like reading progress data:
            // - Has numeric keys (chapter numbers)
            // - Values are arrays (dates)
            if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)))) {
              // Further validate that the values are arrays of dates
              const isValidReadingData = keys.every(k => {
                const chapterData = value[k];
                return Array.isArray(chapterData);
              });
              
              if (isValidReadingData) {
                result[key] = value;
              }
            }
          }
        } catch (e) {
          // Not JSON or parsing error, skip this item
          console.log(`Skipping non-JSON localStorage item: ${key}`);
        }
      }
    }
    
    console.log('getAllLocalReadingProgress: Found reading data for books:', Object.keys(result));
    return result;
  }

  /**
   * Update the last sync timestamp
   */
  private async updateLastSyncTime(): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    const { error } = await this.supabase
      .from('last_sync')
      .upsert({
        user_id: user.id,
        last_synced_at: new Date().toISOString(),
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        }
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error updating last sync time:', error);
    }
  }

  /**
   * Get the last sync timestamp
   */
  async getLastSyncTime(): Promise<Date | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('last_sync')
      .select('last_synced_at')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;
    
    return new Date(data.last_synced_at);
  }
}
