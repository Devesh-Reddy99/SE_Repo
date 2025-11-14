import React, { useState, useEffect } from 'react';
import { searchSlots } from '../services/slotService';
import './SearchSlots.css';

export default function SearchSlots() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, name, date, subject
  const [dateFilter, setDateFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Handle search when any filter changes
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim() && filterType === 'all') {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const query = {
        searchTerm: searchTerm.trim(),
        filterType: filterType,
        date: dateFilter,
        subject: subjectFilter
      };

      const data = await searchSlots(query);
      setResults(data || []);
    } catch (err) {
      setError(err.message || 'Failed to search slots');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setDateFilter('');
    setSubjectFilter('');
    setResults([]);
    setHasSearched(false);
    setError('');
  };

  return (
    <div className="search-slots-container">
      <h2>Search Tutoring Slots</h2>
      
      <form className="search-form" onSubmit={handleSearch}>
        {/* Main Search Bar */}
        <div className="search-bar-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search by tutor name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filter Options */}
        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="filter-type">Filter by:</label>
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Fields</option>
              <option value="name">Tutor Name</option>
              <option value="subject">Subject</option>
              <option value="date">Date</option>
            </select>
          </div>

          {filterType === 'date' && (
            <div className="filter-group">
              <label htmlFor="date-filter">Select Date:</label>
              <input
                type="date"
                id="date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-input"
              />
            </div>
          )}

          {filterType === 'subject' && (
            <div className="filter-group">
              <label htmlFor="subject-filter">Subject:</label>
              <input
                type="text"
                id="subject-filter"
                placeholder="e.g., Mathematics, Physics, Chemistry"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="filter-input"
              />
            </div>
          )}

          <button 
            type="button" 
            onClick={handleClearFilters} 
            className="clear-filters-button"
          >
            Clear Filters
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Results */}
      <div className="search-results">
        {hasSearched && (
          <>
            {loading ? (
              <div className="loading-message">Loading results...</div>
            ) : results.length > 0 ? (
              <>
                <h3>Found {results.length} slot(s)</h3>
                <div className="results-grid">
                  {results.map((slot) => (
                    <div key={slot.id} className="result-card">
                      <div className="result-header">
                        <h4>{slot.subject}</h4>
                        <span className={`status-badge ${slot.status}`}>
                          {slot.status}
                        </span>
                      </div>
                      <div className="result-details">
                        <p>
                          <strong>Tutor:</strong> {slot.tutorName || 'N/A'}
                        </p>
                        <p>
                          <strong>Time:</strong>{' '}
                          {new Date(slot.startTime).toLocaleString()} -{' '}
                          {new Date(slot.endTime).toLocaleString()}
                        </p>
                        <p>
                          <strong>Location:</strong> {slot.location || 'Online'}
                        </p>
                        <p>
                          <strong>Capacity:</strong> {slot.capacity}
                        </p>
                        {slot.description && (
                          <p>
                            <strong>Description:</strong> {slot.description}
                          </p>
                        )}
                      </div>
                      <button className="view-details-button">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-results-message">
                No slots found matching your criteria. Try adjusting your search filters.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
