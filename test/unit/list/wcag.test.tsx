import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { ListCell, ListRow } from '../../../src/list/list-row.js';

describe('ListRow a11y', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <ListRow>
          <ListCell>Cell A</ListCell>
          <ListCell>Cell B</ListCell>
        </ListRow>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('selected row has no axe violations', async () => {
    const { container } = render(
      <div>
        <ListRow selected>
          <ListCell>Selected cell</ListCell>
        </ListRow>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
