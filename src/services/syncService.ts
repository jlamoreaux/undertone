import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ChaptersRead } from "../../hooks/useBooks";
import { getStickyValue, setStickyValue } from "../../hooks/useStickyState";

interface ReadingProgressRecord {
  book_name: string;
  chapter: number;
  read_date: string;
}

export class SyncService {
  private supabase = createClientComponentClient();

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
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    try {
      // First, get cloud data
      const { data: cloudRecords, error: fetchError } = await this.supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      // Get local data
      const localData = this.getAllLocalReadingProgress();
      
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
          mergedData[bookName] = localChapters;
        } else {
          for (const [chapter, dates] of Object.entries(localChapters)) {
            if (!mergedData[bookName][parseInt(chapter)]) {
              mergedData[bookName][parseInt(chapter)] = dates;
            } else {
              // Merge dates, removing duplicates
              const existingDates = mergedData[bookName][parseInt(chapter)].map(d => d.getTime());
              for (const date of dates) {
                if (!existingDates.includes(date.getTime())) {
                  mergedData[bookName][parseInt(chapter)].push(date);
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
      await this.syncToCloud();
      
    } catch (error) {
      console.error('Two-way sync failed:', error);
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
      if (key && !key.startsWith('supabase.') && key !== 'version' && key !== 'lastDatePlayed') {
        const value = getStickyValue(key);
        // Check if it's reading progress data (has chapter numbers as keys)
        if (value && typeof value === 'object') {
          const keys = Object.keys(value as object);
          if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)))) {
            result[key] = value;
          }
        }
      }
    }
    
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
