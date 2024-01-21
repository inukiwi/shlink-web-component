import type { ShlinkOrphanVisitType, ShlinkShortUrl, ShlinkVisit, ShlinkVisitsParams } from '../../api-contract';
import type { DateRange } from '../../utils/dates/helpers/dateIntervals';

export interface UserAgent {
  browser: string;
  os: string;
}

export interface NormalizedRegularVisit extends UserAgent {
  date: string;
  referer: string;
  country: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  potentialBot: boolean;
}

export interface NormalizedOrphanVisit extends NormalizedRegularVisit {
  visitedUrl: string;
  type: ShlinkOrphanVisitType;
}

export type NormalizedVisit = NormalizedRegularVisit | NormalizedOrphanVisit;

export interface CreateVisit {
  shortUrl?: ShlinkShortUrl;
  visit: ShlinkVisit;
}

export type Stats = Record<string, number>;

export type StatsRow = [string, number];

export interface CityStats {
  cityName: string;
  count: number;
  latLong: [number, number];
}

export interface VisitsStats {
  os: Stats;
  browsers: Stats;
  referrers: Stats;
  countries: Stats;
  cities: Stats;
  citiesForMap: Record<string, CityStats>;
  visitedUrls: Stats;
}

export interface VisitsFilter {
  orphanVisitsType?: ShlinkOrphanVisitType | undefined;
  excludeBots?: boolean;
}

export type VisitsFilteringParams = {
  dateRange?: DateRange;
  filter?: VisitsFilter;
};

export type VisitsParams = VisitsFilteringParams & {
  page?: number;
  itemsPerPage?: number;
};

export type HighlightableProps<T extends NormalizedVisit> = T extends NormalizedOrphanVisit
  ? ('referer' | 'country' | 'city' | 'visitedUrl')
  : ('referer' | 'country' | 'city');
