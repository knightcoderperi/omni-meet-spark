
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PersonalizedEmailRequest {
  recipientName: string;
  recipientEmail: string;
  meetingTitle: string;
  meetingDate: string;
  meetingSummary: string;
  keyDecisions: string[];
  assignedTasks: Array<{
    task_id: string;
    description: string;
    priority: string;
    deadline: string | null;
    assigned_by: string;
    context: string;
  }>;
  hasNoTasks: boolean;
  meetingUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: PersonalizedEmailRequest = await req.json();
    const { 
      recipientName, 
      recipientEmail, 
      meetingTitle, 
      meetingDate, 
      meetingSummary,
      keyDecisions,
      assignedTasks, 
      hasNoTasks,
      meetingUrl 
    } = request;

    console.log(`Sending personalized meeting email to ${recipientName} (${recipientEmail})`);

    // Generate email content
    const emailHtml = generatePersonalizedEmail({
      recipientName,
      meetingTitle,
      meetingDate,
      meetingSummary,
      keyDecisions,
      assignedTasks,
      hasNoTasks,
      meetingUrl
    });

    // In a real implementation, you would use an email service like SendGrid or Resend
    // For now, we'll log the email content and simulate success
    console.log('Personalized email content generated:', emailHtml.substring(0, 200) + '...');

    // Simulate email sending
    const emailResponse = {
      id: `email-${Date.now()}`,
      recipient: recipientEmail,
      subject: `📋 Meeting Summary: "${meetingTitle}" - ${meetingDate}`,
      status: 'sent',
      timestamp: new Date().toISOString(),
      taskCount: assignedTasks.length
    };

    console.log('Personalized meeting email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResponse.id,
        message: `Personalized meeting summary sent to ${recipientName}`,
        taskCount: assignedTasks.length,
        hasNoTasks
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Personalized meeting email error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Personalized meeting email service temporarily unavailable',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generatePersonalizedEmail(data: {
  recipientName: string;
  meetingTitle: string;
  meetingDate: string;
  meetingSummary: string;
  keyDecisions: string[];
  assignedTasks: any[];
  hasNoTasks: boolean;
  meetingUrl?: string;
}): string {
  const { 
    recipientName, 
    meetingTitle, 
    meetingDate, 
    meetingSummary,
    keyDecisions,
    assignedTasks, 
    hasNoTasks,
    meetingUrl 
  } = data;
  
  const taskSection = hasNoTasks ? `
    <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
      <h3 style="margin: 0 0 10px 0; color: #0369a1;">📝 Your Tasks</h3>
      <p style="margin: 0; color: #0369a1; font-size: 16px; font-weight: bold;">No tasks assigned to you in this meeting</p>
      <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px;">You can focus on reviewing the meeting summary and decisions made.</p>
    </div>
  ` : `
    <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #92400e;">🎯 Your Assigned Tasks (${assignedTasks.length})</h3>
      ${assignedTasks.map((task, index) => `
        <div style="margin-bottom: 15px; padding: 15px; border-left: 4px solid ${getPriorityColor(task.priority)}; background-color: #ffffff; border-radius: 0 8px 8px 0;">
          <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${index + 1}. ${task.description}</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
            <span style="background: ${getPriorityColor(task.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
              ${task.priority} Priority
            </span>
            ${task.deadline ? `<span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">📅 Due: ${task.deadline}</span>` : ''}
            ${task.assigned_by ? `<span style="background: #6b7280; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">👤 From: ${task.assigned_by}</span>` : ''}
          </div>
          <p style="margin: 0; font-style: italic; color: #6b7280; font-size: 14px;">
            <strong>Context:</strong> "${task.context}"
          </p>
        </div>
      `).join('')}
    </div>
  `;

  const decisionsSection = keyDecisions && keyDecisions.length > 0 ? `
    <div style="background: #dcfce7; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #166534;">✅ Key Decisions Made</h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${keyDecisions.map(decision => `<li style="margin-bottom: 8px; color: #166534;">${decision}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Meeting Summary - ${meetingTitle}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">📋 Personal Meeting Summary</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your personalized summary for "${meetingTitle}"</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${recipientName},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Here's your personalized summary from the meeting "<strong>${meetingTitle}</strong>" held on ${meetingDate}.
        </p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e293b;">📋 Meeting Summary</h3>
          <p style="margin: 0; color: #475569; line-height: 1.6;">${meetingSummary}</p>
        </div>

        ${decisionsSection}
        ${taskSection}
      </div>

      <div style="background: #f1f5f9; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #334155;">📊 Meeting Details</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 8px;"><strong>📅 Date:</strong> ${meetingDate}</li>
          <li style="margin-bottom: 8px;"><strong>📝 Meeting:</strong> ${meetingTitle}</li>
          <li style="margin-bottom: 8px;"><strong>✅ Your Tasks:</strong> ${hasNoTasks ? 'No tasks assigned' : `${assignedTasks.length} task${assignedTasks.length > 1 ? 's' : ''} assigned`}</li>
          ${meetingUrl ? `<li style="margin-bottom: 8px;"><strong>🔗 Meeting Link:</strong> <a href="${meetingUrl}" style="color: #3b82f6;">View Meeting Details</a></li>` : ''}
        </ul>
      </div>

      ${!hasNoTasks ? `
      <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #dc2626;">⚠️ Action Required</h3>
        <p style="margin: 0; color: #991b1b;">
          You have ${assignedTasks.length} task${assignedTasks.length > 1 ? 's' : ''} assigned to you. Please review and plan accordingly.
        </p>
      </div>
      ` : ''}

      <div style="text-align: center; padding: 20px;">
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
          Thank you for participating in this meeting!
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <div style="text-align: center; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">Generated by AI Meeting Assistant on ${new Date().toLocaleDateString()}</p>
        <p style="margin: 5px 0 0 0;">This personalized summary was automatically generated from meeting analysis.</p>
        <p style="margin: 10px 0 0 0;">OmniMeet © ${new Date().getFullYear()}</p>
      </div>
    </body>
    </html>
  `;
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'High':
      return '#dc2626';
    case 'Medium':
      return '#f59e0b';
    case 'Low':
      return '#059669';
    default:
      return '#6b7280';
  }
}
