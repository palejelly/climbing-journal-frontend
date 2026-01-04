<script>
  import { enhance } from '$app/forms';
  import { loader } from '$lib/store/loader.svelte';
  import { toast } from '$lib/store/toast.svelte';
  import { goto } from '$app/navigation';

  let loginMessage = '';
</script>

<div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-4">Welcome!</h1>
    <h2 class="text-2xl text-center text-gray-800 mb-4">Log in to see your videos</h2>

    {#if !loginMessage}

    <!-- 
      1. on:submit is Client-side handling, |preventDefault is event.preventDefault(), this prevents a full page
     reload which is default behavior when you click submit button. So, you can think it as |preventDefault is added to on:submit={handleLogin}
      2.action=? method="POST" will send post request to the same url 
      3. more on use:enhance :If a function is returned, that function is called with the response from the server. 
 If nothing is returned, the fallback will be used. 
      4. <form on:submit|preventDefault={handleLogin} class="space-x-2"> 
      5. ?/login sends POST request to  -->

       <form action="?/login" method="POST" use:enhance={()=>{
        loader.show = true;

        return async ({result})=>{
          //do something with result or after submission
          if(result.type === 'success' && result.status === 200){
            loader.show = false;

            goto('/');
          }else if(result.type === 'redirect'){
            // form response might return a redirect
            goto(result.location, {invalidateAll:true});
          }else{
            //show an error
            const errorText = (result.type ==='error'? result.error.message : result.data?.message)

            toast.text = errorText;
            toast.color = 'red';
            loader.show = false;
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
