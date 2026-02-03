import { MeasurementInputType, SubjectiveAnswerType } from '../constants/measurements';

export interface Measurement {
  id: number;
  subCategoryId: number;
  name: string;
  inputType: MeasurementInputType;
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  step: number | null;
  normalRangeHint: string | null;
  question: string | null;
  answerType: SubjectiveAnswerType | null;
}

export interface TemplateMeasurementEntry {
  id: number;
  measurementId: number;
  measurement: Measurement;
  order: number;
}

export interface TemplateData {
  id: number;
  name: string;
  description: string;
  measurements: TemplateMeasurementEntry[];
}