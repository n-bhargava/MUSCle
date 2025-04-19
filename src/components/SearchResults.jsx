export default function SearchResults({ results, onSelect }) {
  if (!results || results.length === 0) return null;

  // Create a Set to track unique items we've seen
  const uniqueItems = new Set();

  // Filter to only include unique items
  const uniqueResults = results.filter((result) => {
    // For items that are objects with a title property
    const value =
      typeof result.item === "object" && result.item.title
        ? result.item.title.toLowerCase()
        : String(result.item).toLowerCase();

    if (uniqueItems.has(value)) {
      return false; // Skip this item, already have one with this name
    } else {
      uniqueItems.add(value);
      return true;
    }
  });

  return (
    <div className="absolute z-50 bottom-full mb-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto left-0 right-0">
      <ul className="py-1">
        {uniqueResults.map((result, index) => (
          <li
            key={index}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
            onClick={() => onSelect(result.item)}
          >
            {result.item}
          </li>
        ))}
      </ul>
    </div>
  );
}