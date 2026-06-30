/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LegalCase {
  id: number;
  caseIndexNo: string;
  petitionerParty: string;
  respondentParty: string;
  advocateOnRecord: string;
  classificationCategory: string;
  judicialForum: string;
  writCaseType: string;
  filingYearTarget: number;
  currentCaseStatus: string;
  keywordsContentMapping: string;
  filingDateStart: string;
  filingDateEnd: string;
  hearingDateStart: string;
  hearingDateEnd: string;
  hearingIndex: number;
  
  // Custom metadata fields for professional tracking
  notes?: string;
  caseSummary?: string;
  petitionerContact?: string;
  respondentContact?: string;
  hearingHistory?: HearingHistoryEntry[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HearingHistoryEntry {
  hearingNo: number;
  date: string;
  status: string;
  remarks: string;
  completed?: boolean;
  outcome?: string;
}

// Clear mock cases so live production sessions start empty
export const initialCases: LegalCase[] = [];
