import { AppWebsocket, CellId } from '@holochain/conductor-api';
import {
  timestampToMillis,
  millisToTimestamp,
  HoloHashed
} from '@holochain-open-dev/core-types';
import { CalendarEvent } from './types';

export class CalendarEventsService {
  constructor(
    protected appWebsocket: AppWebsocket,
    protected cellId: CellId,
    protected zomeName = 'calendar_events'
  ) {}

  async getAllCalendarEvents(): Promise<Array<HoloHashed<CalendarEvent>>> {
    const events = await this.callZome('get_my_calendar_events', null);

    return events.map(
      ({ entry_hash, entry }: { entry_hash: string; entry: any }) => ({
        hash: entry_hash,
        content: this.entryToEvent(entry),
      })
    );
  }

  async createCalendarEvent({
    title,
    startTime,
    endTime,
    location,
    invitees,
  }: {
    title: string;
    startTime: number;
    endTime: number;
    location?: string;
    invitees: string[];
  }): Promise<HoloHashed<CalendarEvent>> {
    const { entry_hash, entry } = await this.callZome('create_calendar_event', {
      title,
      startTime: millisToTimestamp(startTime),
      endTime: millisToTimestamp(endTime),
      location,
      invitees,
    });

    return {
      hash: entry_hash,
      content: this.entryToEvent(entry),
    };
  }

  async getCalendarEvent(
    calendarEventHash: string
  ): Promise<HoloHashed<CalendarEvent>> {
    const calendarEvent = await this.callZome(
      'get_calendar_event',
      calendarEventHash
    );

    return {
      hash: calendarEventHash,
      content: this.entryToEvent(calendarEvent),
    };
  }
  async callZome(fn_name: string, payload: any) {
    return this.appWebsocket.callZome({
      cap: null as any,
      cell_id: this.cellId,
      zome_name: this.zomeName,
      fn_name: fn_name,
      payload: payload,
      provenance: this.cellId[1],
    });
  }

  /** Helpers */
  private entryToEvent(entry: any): CalendarEvent {
    return {
      ...entry,
      startTime: timestampToMillis(entry.startTime),
      endTime: timestampToMillis(entry.endTime),
    };
  }

}
