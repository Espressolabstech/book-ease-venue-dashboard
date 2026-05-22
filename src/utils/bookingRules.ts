export const ADVANCE_OPTIONS = [
    { label: 'Same day only', value: 0 },
    { label: '1 day ahead', value: 1 },
    { label: '3 days ahead', value: 3 },
    { label: '7 days ahead', value: 7 },
    { label: '14 days ahead', value: 14 },
    { label: '30 days ahead', value: 30 },
];

export const NOTICE_OPTIONS = [
    { label: 'No minimum', value: 0 },
    { label: '1 hour before', value: 1 },
    { label: '2 hours before', value: 2 },
    { label: '4 hours before', value: 4 },
    { label: '24 hours before', value: 24 },
];

export const CANCELLATION_POLICIES = [
    {
        value: 'flexible',
        title: 'Flexible',
        description:
            'Players receive a full refund if they cancel at least 2 hours before their booking.',
    },
    {
        value: 'moderate',
        title: 'Moderate',
        description:
            'Players receive a full refund if they cancel at least 24 hours before their booking.',
    },
    {
        value: 'strict',
        title: 'Strict',
        description:
            'No refunds are provided for cancellations. Players may reschedule subject to availability.',
    },
];
