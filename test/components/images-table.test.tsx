import React from 'react';
import { render, screen } from '@testing-library/react';
import ImagesTable from '../../src/components/images-table.js';
import '@testing-library/jest-dom/extend-expect';

const mockImages = [
  {
    containerId: 'container-1',
    portMappings: [{ hostPort: 8080, containerPort: 80 }],
    envVars: [{ name: 'ENV_VAR_1', value: 'value1' }],
    secrets: [{ name: 'SECRET_1', valueFrom: 'secret1' }],
    volumes: [{ name: 'volume-1' }], 
    cwLogsGroupArn: 'cwLogsGroupArn1',
    memory: 1024, 
    cpu: 1024 
  },
  {
    containerId: 'container-2',
    portMappings: [{ hostPort: 8081, containerPort: 81 }],
    envVars: [{ name: 'ENV_VAR_2', value: 'value2' }],
    secrets: [{ name: 'SECRET_2', valueFrom: 'secret2' }],
    volumes: [{ name: 'volume-2' }], 
    cwLogsGroupArn: 'cwLogsGroupArn1',
    memory: 1024, 
    cpu: 1024
  }
];

describe('ImagesTable', () => {
  it('renders the table with image rows', () => {
    render(<ImagesTable images={mockImages} />);

    // Assert the table headers
    expect(screen.getByText('CONTAINER ID')).toBeInTheDocument();
    expect(screen.getByText('PORT MAPPINGS')).toBeInTheDocument();
    expect(screen.getByText('ENV VARIABLES')).toBeInTheDocument();
    expect(screen.getByText('SECRETS')).toBeInTheDocument();
    expect(screen.getByText('VOLUME')).toBeInTheDocument();
    expect(screen.getByText('View logs')).toBeInTheDocument();

    // Assert the image rows
    expect(screen.getByText('container-1')).toBeInTheDocument();
    expect(screen.getByText('8080:80')).toBeInTheDocument();
    expect(screen.getByText('ENV_VAR_1: value1')).toBeInTheDocument();
    expect(screen.getByText('SECRET_1: secret1')).toBeInTheDocument();
    expect(screen.getByText('volume-1')).toBeInTheDocument();

    expect(screen.getByText('container-2')).toBeInTheDocument();
    expect(screen.getByText('8081:81')).toBeInTheDocument();
    expect(screen.getByText('ENV_VAR_2: value2')).toBeInTheDocument();
    expect(screen.getByText('SECRET_2: secret2')).toBeInTheDocument();
    expect(screen.getByText('volume-2')).toBeInTheDocument();
  });
});
