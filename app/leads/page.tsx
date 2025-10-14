'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Copy, Check, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { columns, Lead } from './columns';
import { Row } from "@tanstack/react-table";

interface LeadWithMessage extends Lead {
  generatedMessage?: string;
  isGenerating?: boolean;
}

interface MessageTemplate {
  id: string;
  name: string;
  style: string;
  description: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadWithMessage[]>([]);
  const [messageTemplates] = useState<MessageTemplate[]>([
    {
      id: 'casual',
      name: 'Casual',
      style: 'friendly and conversational',
      description: 'A relaxed, approachable tone'
    },
    {
      id: 'professional',
      name: 'Professional',
      style: 'formal and business-focused',
      description: 'Traditional business communication'
    },
    {
      id: 'direct',
      name: 'Direct',
      style: 'concise and straightforward',
      description: 'Straight to the point'
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('casual');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, leadId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(leadId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateMessage = async (lead: LeadWithMessage) => {
    try {
      setLeads(prevLeads => 
        prevLeads.map(l => 
          l.id === lead.id 
            ? { ...l, isGenerating: true }
            : l
        )
      );

      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead,
          matchedTopics: [],
          template: selectedTemplate
        }),
      });

      if (!response.ok) throw new Error('Failed to generate message');

      const data = await response.json();
      
      setLeads(prevLeads => 
        prevLeads.map(l => 
          l.id === lead.id 
            ? { ...l, generatedMessage: data.message, isGenerating: false }
            : l
        )
      );

    } catch (error) {
      console.error('Error generating message:', error);
      setLeads(prevLeads => 
        prevLeads.map(l => 
          l.id === lead.id 
            ? { ...l, isGenerating: false }
            : l
        )
      );
    }
  };

  const columnsWithMessage = [
    ...columns,
    {
      id: 'actions',
      cell: ({ row }: { row: Row<LeadWithMessage> }) => {
        const lead = row.original as LeadWithMessage;
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                {messageTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateMessage(lead)}
                className="flex items-center gap-1"
                disabled={lead.isGenerating}
              >
                {lead.isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                {lead.generatedMessage ? 'Regenerate' : 'Generate'} Message
              </Button>
            </div>
            {lead.generatedMessage && (
              <div className="relative max-w-[400px] rounded-md border p-3 text-sm">
                <p className="pr-8 text-muted-foreground">
                  {lead.generatedMessage}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => copyToClipboard(lead.generatedMessage!, lead.id)}
                >
                  {copiedId === lead.id ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">AI Lead Generation</h1>
          <p className="text-muted-foreground mt-2">
            Lead generation functionality is currently being updated
          </p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Lead Generation Under Development
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The lead generation system is currently being updated. This feature will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leads
          </CardTitle>
          <CardDescription>
            {leads.length} potential leads found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columnsWithMessage} data={leads} />
        </CardContent>
      </Card>
    </div>
  );
}