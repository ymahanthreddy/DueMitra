// Real Outbound Telephony Gateway for Kavach OS
// Pure Twilio & Vapi.ai Outbound Voice Engine with ElevenLabs Voice Synthesis

/**
 * Places an outbound cellular phone call to ring target mobile (+91 94834 10461)
 * Supports:
 *  1. Vapi.ai (Autonomous AI Voice Agent with native ElevenLabs voice)
 *  2. Twilio (Direct Carrier REST API)
 */
export async function placeRealPhoneCall({
  to = '+919483410461',
  customerName = 'Valued Customer',
  invoiceNumber = 'KVC/26-27/0038',
  amountFormatted = '₹53,100',
  daysOverdue = 15,
  script = '',
  audioUrl = '',
  // Vapi.ai Credentials
  vapiApiKey = '',
  vapiPhoneNumberId = '',
  vapiAssistantId = '',
  // Twilio Credentials
  twilioSid = '',
  twilioToken = '',
  twilioPhone = '',
}) {
  const cleanTo = to.replace(/[^0-9+]/g, '');
  const formattedTo = cleanTo.startsWith('+') ? cleanTo : `+91${cleanTo.replace(/^0+/, '')}`;

  // 1. VAPI.AI OUTBOUND CALL
  const vApiKey = (vapiApiKey || '').trim() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPI_API_KEY) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('vapi_api_key') || '' : '');

  const vPhoneId = (vapiPhoneNumberId || '').trim() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPI_PHONE_NUMBER_ID) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('vapi_phone_number_id') || '' : '');

  const vAssistantId = (vapiAssistantId || '').trim() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPI_ASSISTANT_ID) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('vapi_assistant_id') || '' : '');

  if (vApiKey) {
    try {
      const vapiPayload = {
        customer: {
          number: formattedTo,
          name: customerName,
        },
      };

      if (vPhoneId) {
        vapiPayload.phoneNumberId = vPhoneId;
      }

      if (vAssistantId) {
        vapiPayload.assistantId = vAssistantId;
        vapiPayload.assistantOverrides = {
          variableValues: {
            customerName,
            invoiceNumber,
            amountFormatted,
            daysOverdue: String(daysOverdue),
          },
        };
      } else {
        vapiPayload.assistant = {
          name: 'Kavach Payment Reminder Agent',
          firstMessage: script || `Namaste! This is Kavach OS calling regarding pending invoice ${invoiceNumber} of ${amountFormatted}.`,
          model: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an empathetic, professional debt collection and payment reconciliation AI voice agent for Kavach OS. You are calling ${customerName} regarding overdue invoice ${invoiceNumber} with amount ${amountFormatted} (${daysOverdue} days overdue). Ask when they can clear the payment and offer UPI or bank transfer.`,
              },
            ],
          },
          voice: {
            provider: '11labs',
            voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
          },
        };
      }

      const res = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vapiPayload),
      });

      const data = await res.json();
      if (res.ok && (data.id || data.status)) {
        return {
          success: true,
          mode: 'vapi_live_call',
          callId: data.id,
          status: data.status || 'queued',
          message: `Vapi.ai outbound call initiated to ${formattedTo}. Phone will ring in 3-5 seconds!`,
        };
      } else {
        throw new Error(data.message || data.error || 'Vapi call dispatch failed');
      }
    } catch (err) {
      console.warn('Vapi call failed:', err.message);
    }
  }

  // 2. TWILIO OUTBOUND VOICE CALL
  const sid = (twilioSid || '').trim() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TWILIO_ACCOUNT_SID) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('twilio_account_sid') || '' : '');
  const token = (twilioToken || '').trim() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TWILIO_AUTH_TOKEN) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('twilio_auth_token') || '' : '');
  const fromPhone = (twilioPhone || '').trim() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TWILIO_PHONE_NUMBER) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('twilio_phone_number') || '' : '');

  if (sid && token && fromPhone) {
    try {
      const twiml = audioUrl
        ? `<Response><Play>${audioUrl}</Play></Response>`
        : `<Response><Say voice="Polly.Aditi" language="en-IN">${script}</Say></Response>`;

      const bodyData = new URLSearchParams();
      bodyData.append('To', formattedTo);
      bodyData.append('From', fromPhone);
      bodyData.append('Twiml', twiml);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${sid}:${token}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyData.toString(),
      });

      const result = await response.json();
      if (response.ok && result.sid) {
        return {
          success: true,
          mode: 'twilio_live_call',
          callSid: result.sid,
          status: result.status,
          message: `Twilio call placed to ${formattedTo}. Phone will ring in 3-5 seconds!`,
        };
      } else {
        throw new Error(result.message || 'Twilio call placement rejected');
      }
    } catch (err) {
      console.warn('Twilio call failed:', err.message);
      return {
        success: false,
        mode: 'twilio_error',
        error: err.message,
      };
    }
  }

  return {
    success: false,
    mode: 'no_telephony_configured',
    message: 'Configure Vapi.ai or Twilio credentials to place real cellular calls.',
  };
}
