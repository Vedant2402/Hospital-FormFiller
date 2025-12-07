const FormPreview = ({ entries, onChange }) => {
  return (
    <div className="space-y-4">
      {entries.map(([key, value], index) => {
        const isCheckbox = key.startsWith("Check Box");

        return (
          <div key={index} className="p-4 rounded-xl bg-white shadow border">
            <div className="flex items-start gap-4">
              {/* Label */}
              <label className="font-medium text-gray-700 w-1/3 break-words">
                {key}
              </label>

              {/* Input */}
              <div className="flex-1">
                {isCheckbox ? (
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => onChange(key, e.target.checked)}
                    className="h-5 w-5 mt-1"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(key, e.target.value)}
                    className="border p-2 rounded-md w-full"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FormPreview;
