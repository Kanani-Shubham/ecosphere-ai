import en from "./en.json";
import hi from "./hi.json";
import gu from "./gu.json";
import es from "./es.json";
import fr from "./fr.json";
import de from "./de.json";
import ar from "./ar.json";
import zh from "./zh.json";

export type SupportedLanguages = "en" | "hi" | "gu" | "es" | "fr" | "de" | "ar" | "zh";

export const ALL_DICTIONARIES: Record<SupportedLanguages, Record<string, string>> = {
  en,
  hi,
  gu,
  es,
  fr,
  de,
  ar,
  zh
};

export class TranslationService {
  /**
   * Translates a given key with the respective language dictionary
   */
  public static translate(
    lang: SupportedLanguages,
    key: string,
    replaceParams?: Record<string, string | number>
  ): string {
    const dictionary = ALL_DICTIONARIES[lang] || ALL_DICTIONARIES.en;
    let text = dictionary[key] ?? ALL_DICTIONARIES.en[key] ?? key;

    if (replaceParams) {
      Object.entries(replaceParams).forEach(([k, val]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(val));
      });
    }

    return text;
  }

  /**
   * Checks if language code is supported
   */
  public static isSupported(lang: string): lang is SupportedLanguages {
    return ["en", "hi", "gu", "es", "fr", "de", "ar", "zh"].includes(lang);
  }
}
