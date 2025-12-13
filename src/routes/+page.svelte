<script>
	import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
	import { preventDefault } from 'svelte/legacy';
  import { enhance } from '$app/forms';
  import fetchData from '$lib/db_blobstorage';

  let activeFilter = 'all';
  let allVideosData = [];
  let filters = [];
  let loading = false;
  let uploading = false;
  let uploadMessage = '';
  let errorMessage = '';
  let showUpload = false;
  let showModal = false;
  let modalVideoUrl = '';
  let modalVideoTitle = '';
  let loginMessage = '';

  // Upload form fields
  let videoTitle = '';
  let videoTags = '';
  let videoFile;

  function clearError() {
    errorMessage = '';
  }

  async function loadVideos() {
    loading = true;
    clearError();
    try {
      allVideosData = await fetchData('/api/videos');
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function loadFilters() {
    try {
      filters = await fetchData('/api/tags');
    } catch {
      filters = [];
    }
  }

  function filterVideos() {
    if (activeFilter === 'all') return allVideosData;
    return allVideosData.filter((v) => v.tags?.includes(activeFilter));
  }

  function openModal(video) {
    modalVideoUrl = video.videoUrl;
    modalVideoTitle = video.title;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    modalVideoUrl = '';
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!videoTitle || !videoFile) {
      uploadMessage = 'Title and video file are required.';
      return;
    }

    const formData = new FormData();
    formData.append('title', videoTitle);
    formData.append('tags', videoTags);
    formData.append('videoFile', videoFile);

    uploading = true;
    uploadMessage = '';

    try {
      const result = await fetchData('/api/upload', { method: 'POST', body: formData });
      uploadMessage = result.message || 'Upload successful!';
      await loadVideos();
      await loadFilters();
      showUpload = false;
    } catch (e) {
      uploadMessage = 'Upload failed.';
    } finally {
      uploading = false;
    }
  }


  onMount(() => {
    loadVideos();
    loadFilters();
  });
</script>

<div class="container mx-auto max-w-6xl p-4 md:p-8 bg-gray-100">
  <h1 class="text-3xl font-bold text-center text-gray-800 mb-4">My Climbing Videos</h1>

  <div class="text-center mb-8">
    {#if !loginMessage}

    <!-- 
      1. on:submit is Client-side handling, |preventDefault is event.preventDefault(), this prevents a full page
     reload which is default behavior when you click submit button. So, you can think it as |preventDefault is added to on:submit={handleLogin}
      2.action=? method="POST" will send post request to the same url 
      3. more on use:enhance :If a function is returned, that function is called with the response from the server. 
 If nothing is returned, the fallback will be used. 
      4. <form on:submit|preventDefault={handleLogin} class="space-x-2"> 
      5. ?/login sends POST request to  -->

       <form action="?/test_env_var" method="POST" use:enhance={()=>{
        return async ({result})=>{
          console.log(result);
          //do something with result or after submission
          if(result.type === 'success' && result.status === 200){
            goto('/');
          }else if(result.type === 'redirect'){
            // form response might return a redirect
            goto(result.location, {invalidateAll:true});
          }else{
            //show an error
            const errorText = (result.type ==='error'? result.error.message : result.data?.message)
            // TODO show error text
          }
       };
      }}>
        <input placeholder="Email" type="text" name="email" required class="border px-2 py-1" />
        <input placeholder="Password" type="password" name="password" required class="border px-2 py-1" />
        <input type="submit" value="Login" class="bg-blue-500 text-white px-3 py-1 rounded" />
      </form>
    {:else}
      <p class="text-green-600 font-semibold">{loginMessage}</p>
      <button on:click={() => (showUpload = !showUpload)} class="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        {showUpload ? 'Back to Gallery' : 'Upload New Video'}
      </button>
    {/if}
  </div>

  {#if showUpload}
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Upload New Video</h2>
      <form on:submit={handleUpload}>
        <div>
          <label>Title:</label>
          <input bind:value={videoTitle} type="text" class="border p-1 w-full" required />
        </div>
        <div>
          <label>Tags (comma-separated):</label>
          <input bind:value={videoTags} type="text" class="border p-1 w-full" />
        </div>
        <div>
          <label>Video File:</label>
          <input type="file" bind:files={videoFile} accept="video/*" required />
        </div>
        <button type="submit" disabled={uploading} class="bg-green-500 text-white px-4 py-2 rounded mt-4">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {#if uploadMessage}<p class="mt-2 text-sm">{uploadMessage}</p>{/if}
    </div>
  {:else}
    <div id="filter-container" class="mb-8 text-center">
      <h2 class="text-xl font-semibold mb-2 text-gray-700">Filter by Tag:</h2>
      <button
        on:click={() => (activeFilter = 'all')}
        class="px-3 py-1 rounded-full border mx-1 {activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white'}">
        Show All
      </button>
      {#each filters as tag}
        <button
          on:click={() => (activeFilter = tag)}
          class="px-3 py-1 rounded-full border mx-1 {activeFilter === tag ? 'bg-blue-500 text-white' : 'bg-white'}">
          {tag}
        </button>
      {/each}
    </div>

    {#if loading}
      <p class="text-center text-blue-500 font-semibold">Loading videos...</p>
    {:else if errorMessage}
      <p class="text-center text-red-600 font-semibold">{errorMessage}</p>
    {:else if filterVideos().length === 0}
      <p class="text-center text-gray-500">No videos found.</p>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {#each filterVideos() as video}
          <div
            class="video-item bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
            on:click={() => openModal(video)}>
            <img
              src={video.thumbnail || 'https://placehold.co/600x400/cccccc/1f2937?text=No+Thumb'}
              alt={video.title}
              class="w-full h-48 object-contain bg-gray-200"
              on:error={(e) => (e.target.src = 'https://placehold.co/600x400/fecaca/1f2937?text=Image+Error')}
            />
            <div class="p-4">
              <h3 class="font-semibold text-gray-800 mb-1 truncate">{video.title}</h3>
              <div class="text-xs text-gray-500 space-x-1">
                {#each video.tags || [] as tag}
                  <span class="inline-block bg-gray-200 rounded-full px-2 py-0.5 capitalize">{tag}</span>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  {#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div class="bg-gray-800 p-4 rounded-lg relative max-w-3xl w-full">
        <button
          on:click={closeModal}
          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 font-bold">
          ×
        </button>
        <h3 class="text-white text-xl mb-2 text-center">{modalVideoTitle}</h3>
        <video src={modalVideoUrl} controls class="w-full max-h-[80vh] rounded"></video>
      </div>
    </div>
  {/if}
</div>

<style>
  body {
    font-family: 'Inter', sans-serif;
  }
</style>
