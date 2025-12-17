"use client";

const CategoryStepIndicator = ({ steps, activeStepName, onStepClick }) => {
  return (
    <div className="flex w-full overflow-x-scroll no-scrollbar lg:overflow-x-visible lg:justify-between" dir="rtl">
      {steps.map((step, index) => {
        const isActive = step.name === activeStepName;
        const activeIndex = steps.findIndex((s) => s.name === activeStepName);
        const isComplete = index < activeIndex;

        return (
          <div
            key={index}
            className="flex flex-col items-center flex-shrink-0 w-32 px-1 lg:flex-1 lg:px-2 cursor-pointer transition-all duration-200"
            onClick={() => onStepClick(step.name)}
          >
            <div
              className={`text-center text-xs mb-1 lg:text-sm lg:mb-2 whitespace-nowrap ${
                isActive ? 'text-blue-500 font-semibold' : 'text-gray-500'
              }`}
            >
              <span className="font-medium ml-1">{step.count}</span>
              <span>{step.label}</span>
            </div>
            <div className="h-1 lg:h-2 bg-gray-200 w-full rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isActive || isComplete ? 'bg-blue-500 w-full' : 'w-0'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryStepIndicator;