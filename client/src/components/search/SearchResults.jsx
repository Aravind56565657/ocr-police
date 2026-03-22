import React from 'react';
import RecordCard from '../records/RecordCard';
import EmptyState from '../ui/EmptyState';
import { Search } from 'lucide-react';

export default function SearchResults({ results, query }) {
    if (results.length === 0) {
        return (
            <EmptyState
                icon={Search}
                title={`No records found for "${query}"`}
                description="Try adjusting your search terms or filters to find what you're looking for."
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map(record => (
                <RecordCard key={record._id} record={record} />
            ))}
        </div>
    );
}
