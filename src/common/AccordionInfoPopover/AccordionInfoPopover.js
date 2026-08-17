import classnames from 'classnames';

import {
  IconButton,
  InfoPopover,
} from '@folio/stripes/components';

import css from './AccordionInfoPopover.css';

const renderPaymentTermsInfoPopoverTrigger = ({ toggle, open, ref }) => {
  const handleClick = (e) => {
    // Prevent the surrounding accordion header from toggling when the info icon is clicked.
    e.stopPropagation();
    toggle();
  };

  return (
    <IconButton
      data-test-info-popover-trigger
      aria-expanded={open}
      className={classnames(css.icon, { [css.open]: open })}
      icon="info"
      iconSize="small"
      onClick={handleClick}
      size="small"
      ref={ref}
    />
  );
};

export const AccordionInfoPopover = (props) => {
  return (
    <InfoPopover
      renderTrigger={renderPaymentTermsInfoPopoverTrigger}
      {...props}
    />
  );
};
