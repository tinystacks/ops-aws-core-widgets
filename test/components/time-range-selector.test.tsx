import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { TimeRangeSelector } from '../../src/components/time-range-selector.js';


describe('TimeRangeSelector', () => {
  it('should update time range when selecting a predefined range', () => {
    const updateTimeRangeMock = jest.fn();
    const { getByLabelText } = render(
      <TimeRangeSelector
        timeRange={{ 
          startTime: (Date.now() - ((7 * 24 * 60 * 60 * 1000))) , 
          endTime: Date.now()
        }}
        updateTimeRange={updateTimeRangeMock}
      />
    );

    fireEvent.click(getByLabelText('1hr'));
    
    expect(updateTimeRangeMock).toHaveBeenCalledWith({ time: 1, unit: 'h' });
  });
});
