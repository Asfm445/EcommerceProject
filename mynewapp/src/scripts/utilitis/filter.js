export function find(id,arr){
    let newval=arr.filter((val)=>{
        return val.id===id
    })
    return newval;
}