<script>
	import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
	import { preventDefault } from 'svelte/legacy';
  import { enhance } from '$app/forms';
  import fetchData from '$lib/db_blobstorage';
	import { toast } from '$lib/store/toast.svelte';
	import { loader } from '$lib/store/loader.svelte';

  export let data;
  console.log("this is data", data);

  let todayDate = new Date().toISOString().split('T')[0];

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
  let activeView = 'feed'; // Options: 'feed' | 'profile'
  let showProfileMenu = false;


  let isEditing = false;
  let editTitle = '';
  let editTags ='';
  let selectedVideo = null; // to track which video is in the modal.

  let searchQuery = ''; // NEW: Track search input

  // UPDATE: Logic to filter by BOTH Tag AND Title
  $: filteredVideos = allVideosData.filter((video) => {
    const matchesTag = activeFilter === 'all' || video.tags?.includes(activeFilter);
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

    
  // Upload form fields
  let videoTitle = '';
  let videoTags = '';
  let videoFile;
  let climbGrade
  let selectedClimbType = 'board';

  function clearError() {
    errorMessage = '';
  }  
  // Close dropdown when clicking outside (optional helper, or just use simple toggle)
  function toggleProfileMenu() {
    showProfileMenu = !showProfileMenu;
  }

  // Navigation Logic
  function navigateTo(view) {
    activeView = view;
    showProfileMenu = false; // Close menu after selection
    loadVideos(); // Refetch data based on new view
  }

  // Update loadVideos to respect activeView
  async function loadVideos() {
    loading = true;
    clearError();
    try {
      let url = '/api/videos';
      
      // If View is 'profile', filter by the logged-in user ID
      if (activeView === 'profile' && data.user) {
        url += `?user_id=${data.user.user_id}`;
      }
      
      allVideosData = await fetchData(url);
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
    console.log("all vid data", allVideosData);
    return allVideosData.filter((v) => v.tags?.includes(activeFilter));
  }

  function openModal(video) {
    selectedVideo = video ; // store the whole object
    modalVideoUrl = video.videoUrl;
    modalVideoTitle = video.title;
    
    editTitle = video.title;
    editTags = video.tags?.join(', ') || '' ;
    
    showModal = true;
    isEditing = false;

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
    formData.append('videoFile', videoFile[0]);   
    formData.append('user_id', data.user.user_id);
    
    // --- NEW FIELDS FIXED HERE ---
    formData.append('climbed_date', todayDate);
    formData.append('grade', climbGrade || '0'); 
    
    // Get values from radio/selects manually if not bound
    const formElement = event.target;
    formData.append('climb_type', formElement.climb_type.value);
    formData.append('board_type', formElement.board_type.value);
    // -----------------------------

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

  async function handleUpdate() {
    try {
      const updatedData = {
        title: editTitle,
        tags: editTags.split(',').map(t => t.trim())
      };
      await fetchData(`/api/videos/${selectedVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      toast.text = "Video updated!";
      showModal = false;
      await loadVideos(); // Refresh list
    } catch (e) {
      toast.text = "Update failed";
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await fetchData(`/api/videos/${selectedVideo.id}`, { method: 'DELETE' });
      toast.text = "Video deleted";
      showModal = false;
      await loadVideos();
    } catch (e) {
      toast.text = "Delete failed";
    }
  }

  onMount(() => {
    loadVideos();
    loadFilters();
  });
</script>

<div class="min-h-screen bg-gray-100 font-sans">
  
  <nav class="bg-white shadow-sm px-4 py-3 sticky top-0 z-40">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <button 
        on:click={() => navigateTo('feed')} 
        class="text-xl font-bold text-gray-800 hover:text-blue-600 transition flex items-center gap-2"
      >
        🧗 Climbing is fun!
      </button>

      <div class="relative">
        {#if data.user}
          <button on:click={toggleProfileMenu} class="flex items-center space-x-2 focus:outline-none">
            <span class="text-sm font-medium text-gray-700 hidden sm:block">{data.user.username}</span>
            <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm hover:bg-blue-600 transition">
              {data.user.username ? data.user.username[0].toUpperCase() : 'U'}            
            </div>
          </button>

          {#if showProfileMenu}
            <div class="fixed inset-0 z-10" on:click={() => showProfileMenu = false}></div>
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border ring-1 ring-black ring-opacity-5">
              <button on:click={() => navigateTo('profile')} class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                🎥 My Videos
              </button>
              <button on:click={() => { showUpload = !showUpload; showProfileMenu = false; }} class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                📤 Upload Video
              </button>
              <hr class="my-1 border-gray-200">
              <a href="/logout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sign out</a>
            </div>
          {/if}
        {:else}
          <a href="/login" class="text-blue-600 font-semibold hover:underline">Login</a>
        {/if}
      </div>
    </div>
  </nav>

  <div class="container mx-auto max-w-6xl p-4 md:p-8">
    
    {#if !data.user}
      <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow mt-10 text-center">
        <h2 class="text-2xl font-bold mb-4">Welcome Back</h2>
        <p class="mb-6 text-gray-600">Login to access the climbing feed.</p>
        
        <form action="?/login" method="POST" use:enhance={()=>{
          loader.show = true;
          return async ({result})=>{
            if(result.type === 'success' && result.status === 200){
              loader.show = false;
              goto('/');
            } else if(result.type === 'redirect'){
              goto(result.location, {invalidateAll:true});
            } else {
              const errorText = (result.type ==='error'? result.error.message : result.data?.message)
              toast.text = errorText;
              toast.color = 'red';
              loader.show = false;
            }
          };
        }} class="space-y-4">
          <input placeholder="Email" type="text" name="email" required class="w-full border px-3 py-2 rounded" />
          <input placeholder="Password" type="password" name="password" required class="w-full border px-3 py-2 rounded" />
          <input type="submit" value="Login" class="w-full bg-blue-500 text-white px-3 py-2 rounded cursor-pointer hover:bg-blue-600" />
        </form>
      </div>

    {:else}
      
      <div class="flex justify-between items-center mb-6 border-b pb-4">
        <h1 class="text-2xl font-bold text-gray-800 border-l-4 border-blue-500 pl-4">
          {activeView === 'feed' ? 'Latest Community Climbs' : 'My Personal Log'}
        </h1>
        
        <button on:click={() => (showUpload = !showUpload)} class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {showUpload ? 'Cancel Upload' : 'Upload'}
        </button>
      </div>

      {#if showUpload}
        <div class="bg-white p-6 rounded-lg shadow-md mb-8 border border-blue-100">
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Upload New Video</h2>
          <form on:submit={handleUpload} class="space-y-4">
            <div>
              <label for="climb_title" class="block font-medium">Title:</label>
              <input bind:value={videoTitle} id="climb_title" type="text" class="border p-2 w-full rounded" required />
            </div>
            <div>
              <label for="climbed_date" class="block font-medium">Climbed Date: </label>
              <input type="date" id="climbed_date" name="climbed_date" bind:value={todayDate} class="border p-2 rounded" />
            </div>        
            <div>
              <p class="block font-medium">Type of Climb: </p>
              <div class="space-x-4 mt-1">
                <label>
                  <input 
                    bind:group={selectedClimbType} 
                    value="board" 
                    type="radio" 
                    name="climb_type" 
                    class="mr-1"
                  />
                  Board
                </label>
                
                <label>
                  <input 
                    bind:group={selectedClimbType} 
                    value="gym" 
                    type="radio" 
                    name="climb_type" 
                    class="mr-1"
                  />
                  Gym
                </label>
                
                <label>
                  <input 
                    bind:group={selectedClimbType} 
                    value="outdoor" 
                    type="radio" 
                    name="climb_type" 
                    class="mr-1"
                  />
                  Outdoor
                </label>
              </div>
            </div>

            {#if selectedClimbType === 'board'}
              <div class="mt-4"> <label for="board_type" class="block font-medium">Type of board:</label>
                <select id="board_type" name="board_type" class="border p-2 rounded w-full">
                  <option value="Tension Board 2">Tension Board 2</option>
                  <option value="Kilter Board">Kilter Board</option>
                  <option value="Moon Board">Moon Board</option>
                </select>
              </div>
            {/if}

            <div>
              <label for="grade" class="block font-medium">Grade: V{climbGrade || 0}</label>
              <input type="range" bind:value={climbGrade} id="grade" name="grade" min="0" max="12" class="w-full" />
            </div>
            <div>
              <label class="block font-medium">Tags (comma-separated):</label>
              <input bind:value={videoTags} type="text" class="border p-2 w-full rounded" />
            </div>
            <div>
              <label class="block font-medium">Video File:</label>
              <input type="file" bind:files={videoFile} accept="video/*" required class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>
            <div class="flex gap-4 mt-6">
              <button 
                type="submit" 
                disabled={uploading} 
                class="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>

              <button 
                type="button" 
                on:click={() => showUpload = false} 
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded font-medium transition"
              >
                Cancel
              </button>
            </div>          
        </form>
          {#if uploadMessage}<p class="mt-2 text-center text-sm font-semibold">{uploadMessage}</p>{/if}
        </div>
      
      {:else}
        <div class="mb-6 relative max-w-md mx-auto">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500">🔍</span>
          </div>
          <input 
            type="text" 
            bind:value={searchQuery} 
            placeholder="Search videos by title..." 
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
          />
        </div>

        <div id="filter-container" class="mb-8 text-center overflow-x-auto whitespace-nowrap py-2">
          <span class="font-semibold text-gray-700 mr-2">Filters:</span>
          <button on:click={() => (activeFilter = 'all')} class="px-3 py-1 rounded-full border mx-1 {activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'}">
            Show All
          </button>
          {#each filters as tag}
            <button on:click={() => activeFilter = tag} class="px-3 py-1 rounded-full border mx-1 {activeFilter === tag ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'}">
              {tag}
            </button>
          {/each}
        </div>

        {#if loading}
          <div class="text-center py-10"><p class="text-blue-500 font-semibold text-xl">Loading videos...</p></div>
        {:else if errorMessage}
          <p class="text-center text-red-600 font-semibold">{errorMessage}</p>
        {:else if filterVideos().length === 0}
          <div class="text-center py-10 bg-white rounded shadow">
            <p class="text-gray-500 text-lg">No videos found.</p>
            {#if activeView === 'profile'}
               <p class="text-sm text-gray-400 mt-2">Upload a video to get started!</p>
            {/if}
          </div>
        {:else}
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {#each filteredVideos as video}
              <div class="video-item bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1" on:click={() => openModal(video)}>
                <img src={video.thumbnail || 'https://placehold.co/600x400/cccccc/1f2937?text=No+Thumb'} alt={video.title} class="w-full h-48 object-cover" on:error={(e) => (e.target.src = 'https://placehold.co/600x400/fecaca/1f2937?text=Image+Error')} />
                <div class="p-4">
                  <h3 class="font-semibold text-gray-800 mb-1 truncate">{video.title}</h3>
                  {#if video.climbed_date}
                    <p class="text-xs text-gray-400 mb-2">{video.climbed_date}</p>
                  {/if}
                  <div class="text-xs text-gray-500 space-x-1 flex flex-wrap gap-1">
                    {#each video.tags || [] as tag}
                      <span class="inline-block bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 capitalize">{tag}</span>
                    {/each}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {/if} {/if} </div>

{#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div class="bg-white p-6 rounded-lg relative max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <button on:click={closeModal} class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl transition">×</button>

        {#if !isEditing}
          <h3 class="text-2xl font-bold mb-2 text-gray-800">{modalVideoTitle}</h3>
          
          <video src={modalVideoUrl} controls class="w-full rounded-lg mb-4 bg-black max-h-[60vh] shadow-sm"></video>
          
          <div class="mb-6 space-y-3 border-b pb-4">
            
            <div class="flex items-center space-x-6 text-sm text-gray-600">
              {#if selectedVideo.climbed_date}
                <div class="flex items-center">
                  <span class="font-semibold mr-2">📅 Date:</span>
                  {selectedVideo.climbed_date}
                </div>
              {/if}
              
              {#if selectedVideo.grade} # assuming you saved grade in metadata
                 <div class="flex items-center">
                  <span class="font-semibold mr-2">🧗 Grade:</span>
                  <span class="font-bold text-blue-600">V{selectedVideo.grade}</span>
                </div>
              {/if}
            </div>

            {#if selectedVideo.tags && selectedVideo.tags.length > 0}
              <div class="flex flex-wrap gap-2 items-center">
                <span class="text-sm font-semibold text-gray-600">Tags:</span>
                {#each selectedVideo.tags as tag}
                  <span class="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full border border-gray-200">
                    #{tag}
                  </span>
                {/each}
              </div>
            {/if}
            
            {#if selectedVideo.board_type}
                <div class="text-sm text-gray-600">
                    <span class="font-semibold">Board:</span> {selectedVideo.board_type}
                </div>
             {/if}
          </div>
          
          {#if data.user && selectedVideo && String(data.user.user_id) === String(selectedVideo.user_id)}
            <div class="flex space-x-3 justify-end">
              <button on:click={() => isEditing = true} class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-medium text-sm">
                ✏️ Edit Details
              </button>
              <button on:click={handleDelete} class="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition font-medium text-sm">
                🗑️ Delete
              </button>
            </div>
          {/if}

        {:else}
          <h3 class="text-xl font-bold mb-4">Edit Video</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input bind:value={editTitle} class="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input bind:value={editTags} class="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div class="flex space-x-2 pt-4 justify-end">
              <button on:click={() => isEditing = false} class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition">Cancel</button>
              <button on:click={handleUpdate} class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm">Save Changes</button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  body {
    font-family: 'Inter', sans-serif;
  }
</style>
