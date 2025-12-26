<div id="join_div">
    <h1>Join C.I.F.</h1>
    <form action="?/join" method="POST" use:enhance={()=>{
    loader.show = true;

    return async ({result})=>{
        console.log(result);
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
    <div>
        <input placeholder="Username" type="text" name="username" required class="border px-2 py-1" />
    </div>

    <div>
        <input placeholder="Email" type="text" name="email" required class="border px-2 py-1" />
    </div>
    <div>
        <input placeholder="Password" type="password" name="password" required class="border px-2 py-1" />
    </div>
    <div>
        <input placeholder="Password confirmation" type="password" name="password_check" required class="border px-2 py-1" />
    </div>

    <div> 
        <input placeholder="Invitation Code" type="password" name="invite_code" required class="border px-2 py-1" />
    </div>
    <div>
        <input type="submit" value="Join" class="bg-blue-500 text-white px-3 py-1 rounded" />
    </div>
    </form>
</div>
