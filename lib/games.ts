export type GameCategory =
  | "poker_nlh"
  | "poker_plo"
  | "poker_other"
  | "blackjack"
  | "baccarat"
  | "roulette"
  | "three_card_poker"
  | "craps"
  | "sic_bo"
  | "pai_gow"
  | "caribbean_stud"
  | "other";

export const GAMES: { code: GameCategory; label: string; group: "poker" | "table" | "other" }[] = [
  { code: "poker_nlh", label: "ポーカー（NLH）", group: "poker" },
  { code: "poker_plo", label: "ポーカー（PLO）", group: "poker" },
  { code: "poker_other", label: "ポーカー（その他）", group: "poker" },
  { code: "blackjack", label: "ブラックジャック", group: "table" },
  { code: "baccarat", label: "バカラ", group: "table" },
  { code: "roulette", label: "ルーレット", group: "table" },
  { code: "three_card_poker", label: "スリーカードポーカー", group: "table" },
  { code: "craps", label: "クラップス", group: "table" },
  { code: "sic_bo", label: "シックボー", group: "table" },
  { code: "pai_gow", label: "パイガオ", group: "table" },
  { code: "caribbean_stud", label: "カリビアンスタッド", group: "table" },
  { code: "other", label: "その他", group: "other" },
];

export function getGameLabel(code: GameCategory): string {
  return GAMES.find((g) => g.code === code)?.label ?? code;
}

export type SessionFormat = "cash" | "tournament";

export const FORMAT_LABEL: Record<SessionFormat, string> = {
  cash: "キャッシュ",
  tournament: "トーナメント",
};

export type Country = "JP" | "KR" | "US" | "TW" | "SG" | "HK" | "MO" | "PH" | "GB" | "AU" | "OTHER";

export const COUNTRIES: { code: Country; label: string; flag: string }[] = [
  { code: "JP", label: "日本", flag: "🇯🇵" },
  { code: "KR", label: "韓国", flag: "🇰🇷" },
  { code: "US", label: "アメリカ", flag: "🇺🇸" },
  { code: "TW", label: "台湾", flag: "🇹🇼" },
  { code: "SG", label: "シンガポール", flag: "🇸🇬" },
  { code: "HK", label: "香港", flag: "🇭🇰" },
  { code: "MO", label: "マカオ", flag: "🇲🇴" },
  { code: "PH", label: "フィリピン", flag: "🇵🇭" },
  { code: "GB", label: "イギリス", flag: "🇬🇧" },
  { code: "AU", label: "オーストラリア", flag: "🇦🇺" },
  { code: "OTHER", label: "その他", flag: "🌐" },
];

export function getCountry(code: Country) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}
