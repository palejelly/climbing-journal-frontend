export const load = async ({locals} ) => {
    if(locals.user){
        return {
            user: locals.user 
            // This is data.user in the +page.svelte.
        }
    }
}
