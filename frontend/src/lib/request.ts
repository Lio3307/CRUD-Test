export default async function getData(url: string) {
    const response = await fetch(url);
    return await response.json()
}