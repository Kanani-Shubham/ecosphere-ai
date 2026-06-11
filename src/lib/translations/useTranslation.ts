import { useStore } from "../store";
import { TranslationService, SupportedLanguages } from "./TranslationService";

export function useTranslation() {
  const settings = useStore((state) => state.settings);
  const lang: SupportedLanguages = (settings?.language || "en") as SupportedLanguages;

  const t = (
    key: string,
    defaultText: string = key,
    replaceParams?: Record<string, string | number>
  ): string => {
    const translated = TranslationService.translate(lang, key, replaceParams);
    return translated === key ? defaultText : translated;
  };

  return {
    t,
    lang,
    supportedLanguages: ["en", "hi", "gu", "es", "fr", "de", "ar", "zh"] as SupportedLanguages[]
  };
}
