import type { EquipmentOption, ItemEquipment } from '@maple/contracts';
import { Fragment } from 'react/jsx-runtime';

import { optionLabelMap, optionOrder, percentKeys, type ItemOptionKey } from './itemOptionMeta';

const getOptionValue = (option: EquipmentOption, key: ItemOptionKey) => {
  return option[key];
};

type ItemOptionListProps = {
  options: ItemEquipment['options'];
};

export const ItemOptionList = ({ options }: ItemOptionListProps) => {
  const { total, starforce, add, base, scroll } = options;

  const visibleKeys = optionOrder.filter((key) => {
    const values = {
      total: getOptionValue(total, key),
      base: getOptionValue(base, key),
      starforce: getOptionValue(starforce, key),
      etc: getOptionValue(scroll, key),
      add: getOptionValue(add, key),
    };

    return values.total !== 0;
  });

  if (visibleKeys.length === 0) return null;

  return (
    <>
      {visibleKeys.map((key) => {
        const totalValue = getOptionValue(total, key);
        const baseValue = getOptionValue(base, key);
        const starforceValue = getOptionValue(starforce, key);
        const etcValue = getOptionValue(scroll, key);
        const addValue = getOptionValue(add, key);
        const isPercentOption = percentKeys.includes(key);

        const detailParts = [
          {
            text: `+${starforceValue}`,
            value: starforceValue,
            className: 'text-yellow-400',
          },
          {
            text: `+${etcValue}`,
            value: etcValue,
            className: 'text-indigo-300/80',
          },
          {
            text: `+${addValue}`,
            value: addValue,
            className: 'text-green-400',
          },
        ].filter((part) => part.value !== 0);

        const hasExtraParts = detailParts.length > 0;

        return (
          <div key={key} className="flex justify-start gap-2.5">
            <span>{optionLabelMap[key]}</span>
            <span className="text-white">
              +{totalValue}
              {isPercentOption ? '%' : ''}
              {hasExtraParts && (
                <>
                  {' '}
                  <span>
                    (<span className="text-white">{baseValue}</span>
                    {detailParts.map((part, index) => (
                      <Fragment key={`${key}-${index}`}>
                        <span className="text-white"> </span>
                        <span className={part.className}>{part.text}</span>
                      </Fragment>
                    ))}
                    )
                  </span>
                </>
              )}
            </span>
          </div>
        );
      })}
    </>
  );
};
