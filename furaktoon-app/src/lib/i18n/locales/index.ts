import type { Dict, Locale } from "../translations";

import { tet } from "./tet";
import { pt_pt } from "./pt_pt";
import { id } from "./id";
import { ms } from "./ms";
import { tl } from "./tl";
import { th } from "./th";
import { vi } from "./vi";
import { my } from "./my";
import { km } from "./km";
import { lo } from "./lo";
import { jv } from "./jv";
import { su } from "./su";
import { ceb } from "./ceb";
import { ban } from "./ban";
import { tpi } from "./tpi";
import { hi } from "./hi";
import { zh } from "./zh";
import { ja } from "./ja";
import { ko } from "./ko";
import { ar } from "./ar";

// All non-English locale dictionaries, keyed by locale code. English lives in
// translations.ts as the source of truth and fallback.
export const localeDicts: Record<Exclude<Locale, "en">, Dict> = {
  tet,
  pt_pt,
  id,
  ms,
  tl,
  th,
  vi,
  my,
  km,
  lo,
  jv,
  su,
  ceb,
  ban,
  tpi,
  hi,
  zh,
  ja,
  ko,
  ar,
};
