const AccordionItem = ({ title, children, isExpanded, onToggle }) => {
  return (
    <div className="accordion-item">
      <h2 className="accordion-header">
        <button
          className={`accordion-button bg-secondary border-0 text-light ${
            isExpanded ? "" : "collapsed"
          }`}
          type="button"
          onClick={onToggle}
        >
          {title}
        </button>
      </h2>
      <div
        className={`accordion-collapse bg-secondary collapse ${
          isExpanded ? "show" : ""
        }`}
      >
        <div className="accordion-body">{children}</div>
      </div>
    </div>
  );
};

export default AccordionItem;
