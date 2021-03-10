import { Lenses } from '@compository/lib';
import { AppWebsocket, CellId } from '@holochain/conductor-api';
import { MyCalendar } from './elements/my-calendar';
//@ts-ignore
import { createUniqueTag } from '@open-wc/scoped-elements/src/createUniqueTag';
import { CalendarEventsService } from './calendar-events.service';

export default function lenses(
  appWebsocket: AppWebsocket,
  cellId: CellId
): Lenses {
  const service = new CalendarEventsService(appWebsocket, cellId);

  return {
    standalone: [
      {
        name: 'My Events Calendar',
        render(root: ShadowRoot) {
          const myCalendarTag = createUniqueTag('my-calendar', customElements);
          root.innerHTML = `
            <link
              href="https://fonts.googleapis.com/icon?family=Material+Icons"
              rel="stylesheet"
            />
              <${myCalendarTag}></${myCalendarTag}>
           `;

          customElements.define(
            myCalendarTag,
            class extends MyCalendar {
              get _calendarEventsService() {
                return service;
              }
            }
          );
        },
      },
    ],
    entryLenses: {},
    attachmentsLenses: [],
  };
}
