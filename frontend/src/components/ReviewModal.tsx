import { Modal, Button, TextInput, Rating, ButtonGroup } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
import { useContext } from 'react';
import { submitReview } from '../services/timeSlotServices';
import coachStore from '../stores/coachStore';

interface ReviewModalProps {
  opened: boolean;
  onClose: () => void;
}

const ReviewModal = observer(({ opened, onClose }: ReviewModalProps) => {
  const { timeSlotStore } = useContext(StoreContext);

  const handleSubmitReview = async () => {
    try {
      const review = await submitReview(timeSlotStore.timeSlotUnderReview);
      timeSlotStore.resetTimeSlotUnderReview();
      coachStore.displayedMeetings.map((slot) => {
        if (slot.tsc_id === review.id) {
          return { ...slot, notes: review.notes, rating: review.rating };
        }
      });
      if (Object.keys(review).length > 0) {
        alert('Success');
      }
    } catch (error) {
      console.error('An error occurred while submitting the review:', error);
      alert(error);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} size='lg'>
      <Rating
        defaultValue={
          timeSlotStore.timeSlotUnderReview.rating
            ? timeSlotStore.timeSlotUnderReview.rating
            : 3
        }
        onChange={(val) => timeSlotStore.updateRating(val)}
      />
      <TextInput
        label='Review:'
        description='Write details of your meeting so you can remember later'
        value={
          timeSlotStore.timeSlotUnderReview.notes
            ? timeSlotStore.timeSlotUnderReview.notes
            : ''
        }
        onChange={(event) => timeSlotStore.updateNotes(event.target.value)}
      />
      <Button onClick={handleSubmitReview}>Submit</Button>
    </Modal>
  );
});

export default ReviewModal;
