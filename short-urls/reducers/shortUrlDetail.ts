import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from '../../../src/utils/helpers/redux';
import type { ProblemDetailsError, ShlinkApiClient } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import type { ShortUrl, ShortUrlIdentifier } from '../data';
import { shortUrlMatches } from '../helpers';

const REDUCER_PREFIX = 'shlink/shortUrlDetail';

export interface ShortUrlDetail {
  shortUrl?: ShortUrl;
  loading: boolean;
  error: boolean;
  errorData?: ProblemDetailsError;
}

export type ShortUrlDetailAction = PayloadAction<ShortUrl>;

const initialState: ShortUrlDetail = {
  loading: false,
  error: false,
};

export const shortUrlDetailReducerCreator = (apiClient: ShlinkApiClient) => {
  const getShortUrlDetail = createAsyncThunk(
    `${REDUCER_PREFIX}/getShortUrlDetail`,
    async ({ shortCode, domain }: ShortUrlIdentifier, { getState }): Promise<ShortUrl> => {
      const { shortUrlsList } = getState();
      const alreadyLoaded = shortUrlsList?.shortUrls?.data.find((url) => shortUrlMatches(url, shortCode, domain));

      return alreadyLoaded ?? await apiClient.getShortUrl(shortCode, domain);
    },
  );

  const { reducer } = createSlice({
    name: REDUCER_PREFIX,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(getShortUrlDetail.pending, () => ({ loading: true, error: false }));
      builder.addCase(getShortUrlDetail.rejected, (_, { error }) => (
        { loading: false, error: true, errorData: parseApiError(error) }
      ));
      builder.addCase(getShortUrlDetail.fulfilled, (_, { payload: shortUrl }) => ({ ...initialState, shortUrl }));
    },
  });

  return { reducer, getShortUrlDetail };
};
