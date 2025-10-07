import { NextResponse } from 'next/server';
import { fetchEmailsFromDate } from '../../api/inbound-email/gmailinputs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    console.log('📅 API request date param:', date);

    if (!date) {
      return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
    }

    const emails = await fetchEmailsFromDate(date);
    console.log('📥 Emails fetched:', emails.length);

    // Sanitize and validate JSON serialization
    let sanitizedEmails;
    try {
      sanitizedEmails = JSON.parse(JSON.stringify(emails));
    } catch (serializationError) {
      console.error('❌ Serialization error:', serializationError);
      return NextResponse.json(
        { error: 'Emails contain unserializable data', details: serializationError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, emails: sanitizedEmails });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
