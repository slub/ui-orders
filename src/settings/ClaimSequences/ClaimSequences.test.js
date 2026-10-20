import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import ClaimSequenceDetail from './ClaimSequenceDetail';
import ClaimSequenceForm from './ClaimSequenceForm';
import { withDeliveryType } from './constants';

const claimSequence = {
  id: 'sequence-id',
  name: 'Serials standard',
  isActive: true,
  afterLastStage: 'STOP',
  stages: [
    { stage: 1, name: '1st claim', deliveryType: 'INTEGRATION', transmissionMethod: 'Email', interval: 14 },
    { stage: 2, name: 'Phone reminder', deliveryType: 'MANUAL', interval: 7, internalNote: 'Call the vendor' },
  ],
};

// Smoke tests only while the PoC is in flux; the full suite comes with the PR.
describe('ClaimSequenceDetail', () => {
  it('should list the stages with their delivery', () => {
    render(<ClaimSequenceDetail initialValues={claimSequence} />);

    expect(screen.getByText('1st claim')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.settings.claimSequences.stage.delivery.email')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.settings.claimSequences.stage.delivery.manual')).toBeInTheDocument();
  });
});

describe('ClaimSequenceForm', () => {
  it('should render one row per stage and submit the changed sequence', async () => {
    const onSubmit = jest.fn();

    render(
      <MemoryRouter>
        <ClaimSequenceForm
          initialValues={claimSequence}
          onSubmit={onSubmit}
          onCancel={jest.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('textbox', { name: 'ui-orders.settings.claimSequences.stage.name' })).toHaveLength(2);

    await userEvent.type(screen.getByRole('textbox', { name: 'ui-orders.settings.claimSequences.name' }), '!');
    await userEvent.click(screen.getByRole('button', { name: 'stripes-components.saveAndClose' }));

    expect(onSubmit.mock.calls[0][0].name).toBe('Serials standard!');
  });
});

describe('withDeliveryType', () => {
  it('should derive the delivery type from the selected transmission method', () => {
    const { stages } = withDeliveryType({
      stages: [
        { name: 'Email stage', transmissionMethod: 'Email' },
        { name: 'Manual stage', transmissionMethod: '' },
        { name: 'Untouched stage' },
      ],
    });

    expect(stages).toEqual([
      { name: 'Email stage', deliveryType: 'INTEGRATION', transmissionMethod: 'Email' },
      { name: 'Manual stage', deliveryType: 'MANUAL' },
      { name: 'Untouched stage', deliveryType: 'MANUAL' },
    ]);
  });
});
