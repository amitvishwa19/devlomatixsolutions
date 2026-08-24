export function TermsAndConditions({ terms, notes }) {
  return (
    <div className="px-6 py-4 border-t border-border bg-secondary/20">
      {notes && notes.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold font-display text-foreground mb-2">Note:</h3>
          <ol className="terms-section list-decimal list-inside">
            {notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ol>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold font-display text-foreground mb-2">Terms & Conditions</h3>
        <ol className="terms-section list-decimal list-inside">
          {terms.map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}