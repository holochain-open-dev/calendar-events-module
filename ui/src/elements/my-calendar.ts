import { html, css, PropertyValues, property, query } from 'lit-element';

import { Calendar } from '@fullcalendar/core';
import type { DateSelectArg } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
// @ts-ignore
import commonStyles from '@fullcalendar/common/main.css';
import dayGridPlugin from '@fullcalendar/daygrid';
// @ts-ignore
import daygridStyles from '@fullcalendar/daygrid/main.css';
import timeGridPlugin from '@fullcalendar/timegrid';
// @ts-ignore
import timeGridStyles from '@fullcalendar/timegrid/main.css';
// @ts-ignore
import bootstrapStyles from 'bootstrap/dist/css/bootstrap.css';
// @ts-ignore
import iconStyles from '@fortawesome/fontawesome-free/css/all.css'; // needs additional webpack config!
import { MenuSurface } from 'scoped-material-components/mwc-menu-surface';
import { LinearProgress } from 'scoped-material-components/mwc-linear-progress';

import { CalendarEvent } from '../types';
import { eventToFullCalendar } from '../utils';
import { CreateCalendarEvent } from './create-calendar-event';
import { HoloHashed } from '@holochain-open-dev/core-types';
import { BaseCalendarElement } from './base-calendar';
import { classMap } from 'lit-html/directives/class-map';

/**
 * @fires event-created - Fired after actually creating the event, containing the new CalendarEvent
 * @csspart calendar - Style the calendar
 */
export abstract class MyCalendar extends BaseCalendarElement {
  /** Public attributes */

  /**
   * Initial calendar view (for reference visit https://fullcalendar.io/docs/plugin-index)
   * @type {'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'}
   * @attr initial-view
   */
  @property({ type: String, attribute: 'initial-view' })
  initialView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' = 'timeGridWeek';

  /** Private properties */

  @property({ type: Boolean, attribute: false }) _loading = true;
  @property({ type: Array, attribute: false }) _myCalendarEvents:
    | Array<HoloHashed<CalendarEvent>>
    | undefined = undefined;

  @query('#calendar')
  _calendarEl!: HTMLElement;

  @query('#create-event-menu')
  _createEventMenu!: MenuSurface;

  @query('#create-calendar-event')
  _createEvent!: CreateCalendarEvent;

  _calendar!: Calendar;

  static get styles() {
    return [
      commonStyles,
      daygridStyles,
      timeGridStyles,
      bootstrapStyles,
      iconStyles,
      css`
        :host {
          display: flex;
        }
      `,
    ];
  }

  async loadCalendarEvents() {
    this._loading = true;
    this._myCalendarEvents = await this._calendarEventsService.getAllCalendarEvents();

    if (this._myCalendarEvents) {
      const fullCalendarEvents = this._myCalendarEvents.map(
        eventToFullCalendar
      );
      this._calendar.removeAllEventSources();
      this._calendar.addEventSource(fullCalendarEvents);
      this._calendar.render();
    }
    this._loading = false;
  }

  getEventBeingCreated(): HTMLElement | undefined {
    const harnesses = this._calendarEl.querySelectorAll(
      '.fc-timegrid-event-harness'
    );

    let eventBeingCreated: HTMLElement | undefined = undefined;
    harnesses.forEach(element => {
      if ((element as HTMLElement).style.zIndex === '') {
        eventBeingCreated = element as HTMLElement;
      }
    });

    return eventBeingCreated;
  }

  openCreateEventMenu(info: DateSelectArg) {
    this._createEventMenu.open = true;

    const element = this.getEventBeingCreated();
    if (element) {
      this._createEventMenu.anchor = element;
    }

    this._createEvent.clear();
    this._createEvent.initialEventProperties = {
      startTime: info.start.valueOf(),
      endTime: info.end.valueOf(),
    };
  }

  setupCalendar() {
    this._calendar = new Calendar(this._calendarEl, {
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
      initialView: this.initialView,
      themeSystem: 'bootstrap',
      selectable: true,
      selectMirror: true,
      unselectAuto: false,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      select: info => {
        if (this._createEventMenu.open) {
          setTimeout(() => this.openCreateEventMenu(info), 100);
        } else this.openCreateEventMenu(info);
      },
    });

    this._calendar.render();
  }

  async firstUpdated() {
    this.setupCalendar();

    this.loadCalendarEvents();
  }

  renderCreateEventCard() {
    return html` <mwc-menu-surface
      id="create-event-menu"
      absolute
      corner="TOP_END"
    >
      <div style="padding: 16px;">
        <hod-create-calendar-event
          id="create-calendar-event"
          @event-created=${(e: CustomEvent) => {
            this._createEventMenu.open = false;
            this.loadCalendarEvents();
          }}
        ></hod-create-calendar-event>
      </div>
    </mwc-menu-surface>`;
  }

  render() {
    return html`
      <div
        style="position: relative; flex: 1; display: flex;"
        class=${classMap({})}
      >
        ${this.renderCreateEventCard()}
        ${this._loading
          ? html`<mwc-linear-progress indeterminate></mwc-linear-progress>`
          : html``}

        <div id="calendar" style="flex: 1;" part="calendar"></div>
      </div>
    `;
  }

  getScopedElements() {
    const service = this._calendarEventsService;
    return {
      'mwc-menu-surface': MenuSurface,
      'mwc-linear-progress': LinearProgress,
      'hod-create-calendar-event': class extends CreateCalendarEvent {
        get _calendarEventsService() {
          return service;
        }
      } as any,
    };
  }
}
