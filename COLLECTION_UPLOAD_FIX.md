# Collection Thumbnail Upload Fix ✅

## Issue

When trying to upload a collection thumbnail during collection creation, the upload was failing
with:

```
Error 400: Collection ID must be a valid UUID
```

## Root Cause

The `ImageInput` component in `CollectionForm` was trying to upload with
`collectionId={collection?.id}`, but when creating a new collection, `collection?.id` is
`undefined`. The backend validation requires a valid UUID for collection uploads.

## Solution ✅

### CollectionForm.tsx

**Before**: Always showed upload functionality, even for new collections

```tsx
<ImageInput
  uploadType='collection-thumbnail'
  collectionId={collection?.id} // undefined for new collections!
  // ...
/>
```

**After**: Conditional rendering based on collection existence

```tsx
{
  collection?.id ? (
    // Editing existing collection - show full upload functionality
    <ImageInput
      uploadType='collection-thumbnail'
      collectionId={collection.id} // Valid UUID
      // ...
    />
  ) : (
    // Creating new collection - URL input only
    <TextField
      label='Cover Image URL'
      placeholder='Enter image URL'
      helperText='Enter a URL for the cover image (you can upload after creating the collection)'
      // ...
    />
  );
}
```

### ModelForm.tsx

Applied the same fix to prevent similar issues:

```tsx
{
  model?.id ? (
    <DragDropUpload
      uploadType='model-image'
      modelId={model.id} // Valid UUID
      // ...
    />
  ) : (
    <Typography>Photo upload will be available after creating the model</Typography>
  );
}
```

## User Experience

- **Creating New Collection**: Users see a simple URL input with helpful text explaining they can
  upload after creation
- **Editing Existing Collection**: Users get the full drag-and-drop upload experience
- **Creating New Model**: Users see a message that photo upload will be available after creation
- **Editing Existing Model**: Users get the full photo upload functionality

## Technical Benefits

- ✅ Prevents UUID validation errors
- ✅ Clear user guidance about when upload is available
- ✅ Maintains all existing functionality for edit scenarios
- ✅ Progressive enhancement pattern (URL first, then upload)

## Status: RESOLVED ✅

The collection thumbnail upload error has been fixed and both CollectionForm and ModelForm now
handle new vs. existing entity scenarios correctly.
