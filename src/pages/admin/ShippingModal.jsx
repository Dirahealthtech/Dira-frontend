import React, { useState } from 'react';
import { X, Truck, Calendar, MapPin, FileText } from 'lucide-react';

const ShippingModal = ({ orderId, onClose, onAssign }) => {
  const [formData, setFormData] = useState({
    tracking_number: '',
    carrier: '',
    estimated_delivery: '',
    status: 'shipped',
    location: '',
    details: {},
    checkpoint: {
      status: 'in_transit',
      location: '',
      description: '',
      timestamp: new Date().toISOString()
    }
  });

  const [loading, setLoading] = useState(false);

  const carriers = [
    { value: 'dhl', label: 'DHL Express' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'ups', label: 'UPS' },
    { value: 'aramex', label: 'Aramex' },
    { value: 'posta', label: 'Posta Kenya' },
    { value: 'g4s', label: 'G4S Courier' },
    { value: 'courier_guy', label: 'The Courier Guy' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'out_for_delivery', label: 'Out for Delivery' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('checkpoint.')) {
      const checkpointField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        checkpoint: {
          ...prev.checkpoint,
          [checkpointField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Format the data according to the API structure
      const shippingData = {
        ...formData,
        estimated_delivery: formData.estimated_delivery ? new Date(formData.estimated_delivery).toISOString() : null,
        checkpoint: {
          ...formData.checkpoint,
          timestamp: new Date().toISOString()
        }
      };
      
      await onAssign(shippingData);
    } catch (error) {
      console.error('Error assigning shipping:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-blue-600" />
            Assign Shipping Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tracking Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Tracking Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number *
              </label>
              <input
                type="text"
                name="tracking_number"
                value={formData.tracking_number}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tracking number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carrier *
              </label>
              <select
                name="carrier"
                value={formData.carrier}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select carrier</option>
                {carriers.map(carrier => (
                  <option key={carrier.value} value={carrier.value}>
                    {carrier.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Estimated Delivery Date
              </label>
              <input
                type="datetime-local"
                name="estimated_delivery"
                value={formData.estimated_delivery}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Current Location */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Current Status & Location
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Nairobi Sorting Facility"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Checkpoint Location
              </label>
              <input
                type="text"
                name="checkpoint.location"
                value={formData.checkpoint.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Checkpoint location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Checkpoint Status
              </label>
              <select
                name="checkpoint.status"
                value={formData.checkpoint.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="in_transit">In Transit</option>
                <option value="arrived">Arrived at Facility</option>
                <option value="departed">Departed from Facility</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivery_attempted">Delivery Attempted</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Checkpoint Description
              </label>
              <textarea
                name="checkpoint.description"
                value={formData.checkpoint.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the current status or any special instructions..."
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Order will be marked as <span className="font-medium">{statusOptions.find(s => s.value === formData.status)?.label}</span></div>
              {formData.tracking_number && (
                <div>Tracking: <span className="font-medium">{formData.tracking_number}</span></div>
              )}
              {formData.carrier && (
                <div>Carrier: <span className="font-medium">{carriers.find(c => c.value === formData.carrier)?.label}</span></div>
              )}
              {formData.estimated_delivery && (
                <div>Estimated delivery: <span className="font-medium">{new Date(formData.estimated_delivery).toLocaleString()}</span></div>
              )}
              <div className="text-blue-600">Customer will receive shipping notification email</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.tracking_number || !formData.carrier}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Assign Shipping
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingModal;