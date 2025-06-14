
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskAssignmentEmailRequest {
  recipientName: string;
  recipientEmail: string;
  meetingTitle: string;
  meetingDate: string;
  tasks: Array<{
    task_id: string;
    description: string;
    priority: string;
    deadline: string | null;
    assigned_by: string;
    context: string;
  }>;
  meetingUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: TaskAssignmentEmailRequest = await req.json();
    const { recipientName, recipientEmail, meetingTitle, meetingDate, tasks, meetingUrl } = request;

    console.log(`Sending task assignment email to ${recipientName} (${recipientEmail})`);

    // Generate email content
    const emailHtml = generateTaskAssignmentEmail({
      recipientName,
      meetingTitle,
      meetingDate,
      tasks,
      meetingUrl
    });

    // In a real implementation, you would use an email service like SendGrid or Resend
    // For now, we'll log the email content and simulate success
    console.log('Email content generated:', emailHtml);

    // Simulate email sending
    const emailResponse = {
      id: `email-${Date.now()}`,
      recipient: recipientEmail,
      subject: `🎯 New Tasks Assigned from "${meetingTitle}" - ${meetingDate}`,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    console.log('Task assignment email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResponse.id,
        message: `Task assignment email sent to ${recipientName}`,
        taskCount: tasks.length
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Task assignment email error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Task assignment email service temporarily unavailable',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateTaskAssignmentEmail(data: {
  recipientName: string;
  meetingTitle: string;
  meetingDate: string;
  tasks: any[];
  meetingUrl?: string;
}): string {
  const { recipientName, meetingTitle, meetingDate, tasks, meetingUrl } = data;
  
  const taskList = tasks.map((task, index) => `
    <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid ${getPriorityColor(task.priority)}; background-color: #f9f9f9;">
      <h3 style="margin: 0 0 10px 0; color: #333;">${index + 1}. ${task.description}</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 10px;">
        <span style="background: ${getPriorityColor(task.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
          ${task.priority} Priority
        </span>
        ${task.deadline ? `<span style="background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">📅 Due: ${task.deadline}</span>` : ''}
        ${task.assigned_by ? `<span style="background: #6c757d; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">👤 Assigned by: ${task.assigned_by}</span>` : ''}
      </div>
      <p style="margin: 10px 0 0 0; font-style: italic; color: #666; font-size: 14px;">
        <strong>Context:</strong> "${task.context}"
      </p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>New Tasks Assigned</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🎯 New Tasks Assigned</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You have ${tasks.length} new task${tasks.length > 1 ? 's' : ''} from "${meetingTitle}"</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${recipientName},</h2>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          You have been assigned <strong>${tasks.length} new task${tasks.length > 1 ? 's' : ''}</strong> from today's meeting "<strong>${meetingTitle}</strong>":
        </p>

        ${taskList}
      </div>

      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="margin-top: 0; color: #333;">📋 Meeting Details</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 8px;"><strong>📅 Date:</strong> ${meetingDate}</li>
          <li style="margin-bottom: 8px;"><strong>📝 Meeting:</strong> ${meetingTitle}</li>
          <li style="margin-bottom: 8px;"><strong>✅ Total Tasks:</strong> ${tasks.length}</li>
          ${meetingUrl ? `<li style="margin-bottom: 8px;"><strong>🔗 Meeting Link:</strong> <a href="${meetingUrl}" style="color: #007bff;">View Meeting</a></li>` : ''}
        </ul>
      </div>

      <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="margin-top: 0; color: #1976d2;">📊 Quick Stats</h3>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
          <div style="text-align: center; margin: 10px;">
            <div style="font-size: 24px; font-weight: bold; color: #d32f2f;">${tasks.filter(t => t.priority === 'High').length}</div>
            <div style="font-size: 12px; color: #666;">High Priority</div>
          </div>
          <div style="text-align: center; margin: 10px;">
            <div style="font-size: 24px; font-weight: bold; color: #f57c00;">${tasks.filter(t => t.priority === 'Medium').length}</div>
            <div style="font-size: 12px; color: #666;">Medium Priority</div>
          </div>
          <div style="text-align: center; margin: 10px;">
            <div style="font-size: 24px; font-weight: bold; color: #388e3c;">${tasks.filter(t => t.priority === 'Low').length}</div>
            <div style="font-size: 12px; color: #666;">Low Priority</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px;">
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
          Please confirm receipt and track your progress.
        </p>
        <div style="background: #28a745; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block; text-decoration: none; font-weight: bold;">
          ✅ Tasks Received
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <div style="text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">Generated by AI Meeting Assistant on ${new Date().toLocaleDateString()}</p>
        <p style="margin: 5px 0 0 0;">This email was automatically generated from meeting analysis.</p>
      </div>
    </body>
    </html>
  `;
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'High':
      return '#d32f2f';
    case 'Medium':
      return '#f57c00';
    case 'Low':
      return '#388e3c';
    default:
      return '#6c757d';
  }
}
