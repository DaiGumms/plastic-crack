import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { BetaInterestForm } from '../../components/beta/BetaInterestForm';
import { renderWithProviders, createTestBetaInterest } from '../test-utils';

// Mock the useBetaInterest hook
const mockSubmitInterest = jest.fn();
const mockCheckStatus = jest.fn();

jest.mock('../../hooks/useBetaInterest', () => ({
  useBetaInterest: () => ({
    submitInterest: mockSubmitInterest,
    checkStatus: mockCheckStatus,
    isLoading: false,
    error: null,
    isSuccess: false,
  }),
}));

describe('BetaInterestForm', () => {
  beforeEach(() => {
    mockSubmitInterest.mockClear();
    mockCheckStatus.mockClear();
  });

  it('renders the form with all required fields', () => {
    renderWithProviders(<BetaInterestForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /join beta/i })
    ).toBeInTheDocument();
  });

  it('shows validation errors for invalid email', async () => {
    const { user } = renderWithProviders(<BetaInterestForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /join beta/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  it('requires email field', async () => {
    const { user } = renderWithProviders(<BetaInterestForm />);

    const submitButton = screen.getByRole('button', { name: /join beta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const { user } = renderWithProviders(<BetaInterestForm />);
    const testData = createTestBetaInterest();

    mockSubmitInterest.mockResolvedValue({ success: true });

    const emailInput = screen.getByLabelText(/email address/i);
    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /join beta/i });

    await user.type(emailInput, testData.email);
    await user.type(nameInput, testData.name);

    // Select interests
    const collectionCheckbox = screen.getByLabelText(/collection management/i);
    await user.click(collectionCheckbox);

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitInterest).toHaveBeenCalledWith(
        expect.objectContaining({
          email: testData.email,
          name: testData.name,
          interests: expect.arrayContaining(['collection-management']),
        })
      );
    });
  });

  it('displays interest options', () => {
    renderWithProviders(<BetaInterestForm />);

    expect(screen.getByText(/what interests you most/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/collection management/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/painting guides/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price tracking/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/community features/i)).toBeInTheDocument();
  });

  it('allows multiple interest selections', async () => {
    const { user } = renderWithProviders(<BetaInterestForm />);

    const collectionCheckbox = screen.getByLabelText(/collection management/i);
    const paintingCheckbox = screen.getByLabelText(/painting guides/i);

    await user.click(collectionCheckbox);
    await user.click(paintingCheckbox);

    expect(collectionCheckbox).toBeChecked();
    expect(paintingCheckbox).toBeChecked();
  });

  it('calls onSuccess callback when form is submitted successfully', async () => {
    const onSuccess = jest.fn();
    const { user } = renderWithProviders(
      <BetaInterestForm onSuccess={onSuccess} />
    );

    mockSubmitInterest.mockResolvedValue({ success: true });

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /join beta/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('is accessible', async () => {
    renderWithProviders(<BetaInterestForm />);

    // Check for proper form labeling
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');

    // Check for form structure
    expect(screen.getByRole('form')).toBeInTheDocument();

    // Check for button accessibility
    const submitButton = screen.getByRole('button', { name: /join beta/i });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('shows loading state during submission', async () => {
    // Mock loading state
    jest.doMock('../../hooks/useBetaInterest', () => ({
      useBetaInterest: () => ({
        submitInterest: mockSubmitInterest,
        checkStatus: mockCheckStatus,
        isLoading: true,
        error: null,
        isSuccess: false,
      }),
    }));

    renderWithProviders(<BetaInterestForm />);

    const submitButton = screen.getByRole('button', { name: /join beta/i });
    expect(submitButton).toBeDisabled();
  });
});
