import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { pick } from 'ramda';
import { createAsyncThunk } from '../../../src/utils/helpers/redux';
import type { ColorGenerator } from '../../../src/utils/services/ColorGenerator';
import type { ProblemDetailsError, ShlinkApiClient } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';

const REDUCER_PREFIX = 'shlink/tagEdit';

export interface TagEdition {
  oldName?: string;
  newName?: string;
  editing: boolean;
  edited: boolean;
  error: boolean;
  errorData?: ProblemDetailsError;
}

export interface EditTag {
  oldName: string;
  newName: string;
  color: string;
}

export type EditTagAction = PayloadAction<EditTag>;

const initialState: TagEdition = {
  editing: false,
  edited: false,
  error: false,
};

export const tagEdited = createAction<EditTag>(`${REDUCER_PREFIX}/tagEdited`);

export const editTag = (
  apiClient: ShlinkApiClient,
  colorGenerator: ColorGenerator,
) => createAsyncThunk(
  `${REDUCER_PREFIX}/editTag`,
  async ({ oldName, newName, color }: EditTag): Promise<EditTag> => {
    await apiClient.editTag(oldName, newName);
    colorGenerator.setColorForKey(newName, color);

    return { oldName, newName, color };
  },
);

export const tagEditReducerCreator = (editTagThunk: ReturnType<typeof editTag>) => createSlice({
  name: REDUCER_PREFIX,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(editTagThunk.pending, () => ({ editing: true, edited: false, error: false }));
    builder.addCase(
      editTagThunk.rejected,
      (_, { error }) => ({ editing: false, edited: false, error: true, errorData: parseApiError(error) }),
    );
    builder.addCase(editTagThunk.fulfilled, (_, { payload }) => ({
      ...pick(['oldName', 'newName'], payload),
      editing: false,
      edited: true,
      error: false,
    }));
  },
});
