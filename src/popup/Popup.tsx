import styled from "@emotion/styled";

const PopupContainer = styled.div`
  width: 800px;
  height: 600px;
  background: lightgrey;
`;
export const Popup = () => {
  return (
    <PopupContainer>
      <label>
        <span>Minimum Trigger String Length:</span>
        <input type="number" placeholder="1" min={1} max={20} />
      </label>
    </PopupContainer>
  );
};
