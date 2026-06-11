import {
  TranslationService,
  SupportedLanguages,
  ALL_DICTIONARIES
} from "./translations/TranslationService";
import { useTranslation } from "./translations/useTranslation";

export type { SupportedLanguages };
export { TranslationService, useTranslation };

export const TRANSLATIONS = ALL_DICTIONARIES;

/**
 * Backwards compatible localized string lookup
 */
export const getLocalized = (
  lang: SupportedLanguages,
  key: string,
  replaceParams?: Record<string, string | number>
): string => {
  return TranslationService.translate(lang, key, replaceParams);
};
