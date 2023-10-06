export async function promiseAllInFlat<T>(promises: Array<Promise<Array<T>>>): Promise<Array<T>> {
    return Promise.all(promises).then((items) => items.flat());
}
