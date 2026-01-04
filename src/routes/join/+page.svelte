<script>
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
  import { toast } from '$lib/store/toast.svelte';
  import { loader } from '$lib/store/loader.svelte';
</script>

<div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
  <div id="join_div" class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Join ClimbingIsFun 🧗</h1>
    
    <form 
    action="?/join" 
    method="POST" 
    class="space-y-4"
    use:enhance={() => {
        loader.show = true; // Show the gray loader

        return async ({ result }) => {
        console.log(result);

        if (result.type === 'success') {
            loader.show = false; 
            toast.text = "Account created! Welcome.";
            toast.color = 'green';
            goto('/');
        } else if (result.type === 'redirect') {
            // --- FIX IS HERE ---
            // Hide the loader before navigating to the login page
            loader.show = false; 
            goto(result.location, { invalidateAll: true });
        } else {
            // Handle failure/error
            const errorText = (result.type === 'error' ? result.error.message : result.data?.message);
            toast.text = errorText || "An error occurred";
            toast.color = 'red';
            loader.show = false; // Ensure it hides on error too
        }
        };
    }}>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input placeholder="ClimberName" type="text" name="username" required class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input placeholder="email@example.com" type="email" name="email" required class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input placeholder="••••••••" type="password" name="password" required class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
          <input placeholder="••••••••" type="password" name="password_check" required class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
        </div>
      </div>

      <div class="pt-2">
        <label class="block text-sm font-medium text-gray-700 mb-1 text-orange-600 font-bold">Invitation Code</label>
        <input placeholder="Enter secret code" type="password" name="invite_code" required class="w-full border-2 border-orange-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" />
      </div>

      <div class="pt-4">
        <input type="submit" value="Create Account" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg cursor-pointer transition shadow-md active:transform active:scale-95" />
      </div>
      
      <p class="text-center text-sm text-gray-500 mt-4">
        Already have an account? <a href="/login" class="text-blue-600 hover:underline">Log in</a>
      </p>
    </form>
  </div>
</div>