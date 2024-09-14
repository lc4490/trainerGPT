import { NextResponse } from 'next/server';
import ICAL from 'ical.js';

export async function POST(req) {
  try {
    const json = await req.json();
    const { icsData } = json;

    console.log("ICS Data received:", icsData);

    if (!icsData || typeof icsData !== 'string') {
      return NextResponse.json({ message: 'Invalid ICS data' }, { status: 400 });
    }

    // Parse the ICS data using ical.js
    const jcalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const events = comp.getAllSubcomponents('vevent').map(event => {
      const vevent = new ICAL.Event(event);
      return {
        title: vevent.summary || 'No Title',
        start: vevent.startDate.toString(),
        end: vevent.endDate ? vevent.endDate.toString() : null,
        allDay: vevent.isAllDay,
        extendedProps: {
          details: vevent.description || 'No Details',
        },
      };
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error in handler:", error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
