'use client';

import React, { useState } from 'react';
import { PracticeIssue, PracticeWithComputed } from '@/types';
import CollapsibleSection from './CollapsibleSection';

interface IssuesSectionProps {
  practice: PracticeWithComputed;
  issues: PracticeIssue[];
  onAddIssue: (issue: Omit<PracticeIssue, 'id' | 'status' | 'createdAt'>) => void;
  onUpdateIssue: (issueId: string, updates: Partial<PracticeIssue>) => void;
  onResolveIssue: (issueId: string, resolvedBy: string) => void;
  onDeleteIssue: (issueId: string) => void;
}

export default function IssuesSection({
  practice,
  issues,
  onAddIssue,
  onUpdateIssue,
  onResolveIssue,
  onDeleteIssue
}: IssuesSectionProps) {
  // Form state for adding new issue
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Separate active and resolved issues
  const activeIssues = issues.filter(i => i.status === 'active');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  const handleAddIssue = () => {
    if (!newTitle.trim() || !newDescription.trim()) return;

    onAddIssue({
      practiceId: practice.id,
      title: newTitle.trim(),
      description: newDescription.trim(),
      createdBy: 'current-user' // TODO: Get from auth context
    });

    // Reset form
    setNewTitle('');
    setNewDescription('');
  };

  const handleStartEdit = (issue: PracticeIssue) => {
    setEditingId(issue.id);
    setEditTitle(issue.title);
    setEditDescription(issue.description);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editTitle.trim() || !editDescription.trim()) return;

    onUpdateIssue(editingId, {
      title: editTitle.trim(),
      description: editDescription.trim()
    });

    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleResolve = (issueId: string) => {
    onResolveIssue(issueId, 'current-user'); // TODO: Get from auth context
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Add New Issue Form */}
      <div className="border border-border rounded-lg p-4 bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground mb-3">Add New Issue</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Detailed explanation of the issue and context"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm resize-none"
            />
          </div>
          <button
            onClick={handleAddIssue}
            disabled={!newTitle.trim() || !newDescription.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Issue
          </button>
        </div>
      </div>

      {/* Active Issues */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Active Issues ({activeIssues.length})
        </h3>
        {activeIssues.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">No active issues</div>
        ) : (
          <div className="space-y-3">
            {activeIssues.map((issue) => (
              <div
                key={issue.id}
                className="border border-border rounded-lg p-4 bg-background"
              >
                {editingId === issue.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editTitle.trim() || !editDescription.trim()}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/80"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="mb-2">
                      <h4 className="font-semibold text-foreground text-sm">{issue.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                      {issue.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Created {formatDate(issue.createdAt)} by {issue.createdBy}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolve(issue.id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleStartEdit(issue)}
                          className="px-3 py-1.5 bg-muted text-foreground rounded-md text-xs font-medium hover:bg-muted/80"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteIssue(issue.id)}
                          className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs font-medium hover:bg-destructive/90"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Issues */}
      {resolvedIssues.length > 0 && (
        <CollapsibleSection
          title="Resolved Issues"
          count={resolvedIssues.length}
          defaultExpanded={false}
        >
          <div className="space-y-3">
            {resolvedIssues.map((issue) => (
              <div
                key={issue.id}
                className="border border-border rounded-lg p-4 bg-muted/30"
              >
                <div className="mb-2">
                  <h4 className="font-semibold text-foreground text-sm">{issue.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                  {issue.description}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Created {formatDate(issue.createdAt)} by {issue.createdBy}</div>
                  {issue.resolvedAt && issue.resolvedBy && (
                    <div className="text-green-600">
                      ✓ Resolved {formatDate(issue.resolvedAt)} by {issue.resolvedBy}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
