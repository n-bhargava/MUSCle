import useGameContext from "../context/useGameContext";

export default function AttemptList() {
  const { attemptResults, components } = useGameContext();

  if (attemptResults.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-2 text-gray-600">
        Previous Attempts
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              {components.map((component) => (
                <th
                  key={component}
                  className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {component}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attemptResults.map((result, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                {components.map((component) => (
                  <td
                    key={component}
                    className={`py-2 px-3 whitespace-nowrap text-sm ${
                      result[component].correct
                        ? "text-green-700 font-medium"
                        : "text-red-700"
                    }`}
                  >
                    {result[component].value}
                    {result[component].correct}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
