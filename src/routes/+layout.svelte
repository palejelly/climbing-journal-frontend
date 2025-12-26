<script>
	import favicon from '$lib/assets/favicon.svg';
	import Loader from '$lib/components/Loader.svelte';
	import Notification from '$lib/components/Notification.svelte';
  	import "../app.css";

	let { children } = $props();
</script>
<Loader/>
<Notification/>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
