export async function promiseAllInFlat<T>(promises: Array<Promise<Array<T>>>): Promise<Array<T>> {
    return (
        Promise.all(promises)
            // prettier-ignore
            .then((items) => items.flat())
    );
}
