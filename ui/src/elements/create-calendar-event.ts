import { html, property, query } from 'lit-element';
import { TextField } from 'scoped-material-components/mwc-textfield';
import { Button } from 'scoped-material-components/mwc-button';

import { CalendarEvent } from '../types';
import { sharedStyles } from './sharedStyles';
import { BaseCalendarElement } from './base-calendar';

/**
 * @fires event-created - Fired after actually creating the event, containing the new CalendarEvent
 * @csspart event-title - Style the event title textfield
 */
export abstract class CreateCalendarEvent extends BaseCalendarElement {
  static get styles() {
    return sharedStyles;
  }
  static get scopedElements() {
    return {
      'mwc-textfield': TextField,
      'mwc-button': Button,
    };
  }

  /** Public attributes */

  /**
   * Initial calendar event parameters with which to populate the form
   * @type Partial<CalendarEvent>
   */
  @property({ type: Object, attribute: false })
  initialEventProperties: Partial<CalendarEvent> | undefined = undefined;

  /** Private properties */

  @query('#event-title')
  _titleField!: TextField;

  async createEvent() {
    const calendarEvent = await this._calendarEventsService.createCalendarEvent({
      title: this._titleField.value,
      startTime: this.initialEventProperties?.startTime as number,
      endTime: this.initialEventProperties?.endTime as number,
      location: undefined,
      invitees: [],
    });

    this.dispatchEvent(
      new CustomEvent('event-created', {
        detail: {
          event: calendarEvent,
        },
        composed: true,
        bubbles: true,
      })
    );
  }

  render() {
    return html`
      <div class="column">
        <mwc-textfield
          id="event-title"
          placeholder="Event title"
          .value=${this.initialEventProperties?.title || ''}
          part="event-title"
        ></mwc-textfield>

        <span style="margin-top: 16px">
          Start Time:
          ${new Date(
            this.initialEventProperties?.startTime as number
          ).toLocaleString()}
        </span>
        <span style="margin-top: 8px">
          End Time:
          ${new Date(
            this.initialEventProperties?.endTime as number
          ).toLocaleString()}
        </span>

        <div class="row" style="align-self: flex-end; margin-top: 16px;">
          <mwc-button
            id="create-event-button"
            label="CREATE"
            @click=${() => this.createEvent()}
          ></mwc-button>
        </div>
      </div>
    `;
  }

  /**
   * Clears all previously filled values of the form
   * @method
   */
  public clear() {
    this._titleField.value = '';
  }
}
